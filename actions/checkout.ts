"use server";

// Server Actions for /checkout (docs/design.md 6.7, docs/spec.md 5.8). Every action calls
// requireUser first (CLAUDE.md: "Every checkout action calls requireUser"), and every amount
// comes from computeTotals on the server - the client only ever displays what these return.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { getCartOwner } from "@/lib/cart-owner";
import { resolveCheckoutSource } from "@/lib/checkout/source";
import { verifyPaymentForOrder } from "@/lib/checkout/verify-payment";
import { isUsState, type UsState } from "@/lib/constants/us-states";
import { ROUTES } from "@/lib/constants/links";
import { getAddress } from "@/lib/data/addresses";
import { createOrderFromPayment, InsufficientStockError, STOCK_GUARD_ERROR } from "@/lib/data/orders";
import { addPaymentMethod, getPaymentMethod } from "@/lib/data/payments";
import { findUserById, updateUser } from "@/lib/data/users";
import { withTransaction } from "@/lib/db/client";
import type { AddressSnapshot } from "@/lib/db/schema";
import { deliveryDate, formatDeliveryDate } from "@/lib/pricing/delivery";
import { newOrderId } from "@/lib/pricing/order-id";
import type { DeliverySpeed } from "@/lib/pricing/shipping";
import { shippingCents } from "@/lib/pricing/shipping";
import { computeTotals, type OrderTotals } from "@/lib/pricing/totals";
import { stripe } from "@/lib/stripe";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const PAYMENT_VERIFY_ERROR = "Your payment could not be confirmed. Please try again.";
const ADDRESS_REQUIRED_ERROR = "Select a delivery address.";
const STOCK_ERROR = `${STOCK_GUARD_ERROR}.`;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : GENERIC_ERROR;
}

export type QuoteCheckoutInput = { addressId: string | null; speed: DeliverySpeed; buy?: string };

export type QuoteCheckoutResult = {
  totals: OrderTotals;
  standardDate: string;
  fastDate: string;
  standardShippingCents: number;
  fastShippingCents: number;
  itemCount: number;
};

// Re-quoted on every address or speed change (docs/design.md 6.7). Before an address is chosen,
// falls back to a no-tax placeholder state so the order summary shows a real running total
// instead of "--" the whole time - "Place your order" stays disabled until a real address exists
// (components/checkout/OrderSummary.tsx), so this estimate is never what gets charged.
const NO_ADDRESS_PLACEHOLDER_STATE: UsState = "OR";

export async function quoteCheckout(input: QuoteCheckoutInput): Promise<QuoteCheckoutResult> {
  const user = await requireUser(ROUTES.checkout);
  const owner = await getCartOwner();
  const source = await resolveCheckoutSource(owner, input.buy);
  const lines = source.lines.map((line) => ({ unitPriceCents: line.unitPriceCents, quantity: line.quantity }));

  let state: UsState = NO_ADDRESS_PLACEHOLDER_STATE;
  if (input.addressId) {
    const address = await getAddress(user.id, input.addressId);
    if (address && isUsState(address.state)) state = address.state;
  }

  const totals = computeTotals({ lines, speed: input.speed, state });
  const now = new Date();
  const itemCount = source.lines.reduce((sum, line) => sum + line.quantity, 0);

  return {
    totals,
    standardDate: formatDeliveryDate(deliveryDate(now, "standard")),
    fastDate: formatDeliveryDate(deliveryDate(now, "fast")),
    standardShippingCents: shippingCents(totals.itemsCents, "standard"),
    fastShippingCents: shippingCents(totals.itemsCents, "fast"),
    itemCount,
  };
}

export type CreatePaymentIntentInput = {
  addressId: string;
  speed: DeliverySpeed;
  buy?: string;
  paymentMethodId?: string;
  saveCard: boolean;
};

export type CreatePaymentIntentResult = { ok: true; clientSecret: string } | { ok: false; error: string };

export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentResult> {
  const user = await requireUser(ROUTES.checkout);

  const address = await getAddress(user.id, input.addressId);
  if (!address || !isUsState(address.state)) return { ok: false, error: ADDRESS_REQUIRED_ERROR };

  const owner = await getCartOwner();
  const source = await resolveCheckoutSource(owner, input.buy);
  if (source.lines.length === 0) return { ok: false, error: STOCK_ERROR };
  if (source.lines.some((line) => line.quantity > line.stock)) return { ok: false, error: STOCK_ERROR };

  const totals = computeTotals({
    lines: source.lines.map((line) => ({ unitPriceCents: line.unitPriceCents, quantity: line.quantity })),
    speed: input.speed,
    state: address.state,
  });

  let savedPaymentMethod = null;
  if (input.paymentMethodId) {
    savedPaymentMethod = await getPaymentMethod(user.id, input.paymentMethodId);
    if (!savedPaymentMethod) return { ok: false, error: GENERIC_ERROR };
  }

  const userRow = await findUserById(user.id);
  if (!userRow) return { ok: false, error: GENERIC_ERROR };

  let customerId = userRow.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: userRow.email, name: userRow.name });
    customerId = customer.id;
    await updateUser(user.id, { stripeCustomerId: customerId });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: totals.totalCents,
      currency: "usd",
      customer: customerId,
      metadata: {
        userId: user.id,
        addressId: address.id,
        speed: input.speed,
        buy: source.kind === "buy" ? source.buy : "",
        saveCard: input.saveCard ? "1" : "0",
      },
      // Cards only: bank and pay-later methods settle later or redirect, and an order is only
      // created once the PaymentIntent has already succeeded.
      payment_method_types: ["card"],
      ...(savedPaymentMethod ? { payment_method: savedPaymentMethod.stripePaymentMethodId } : {}),
      ...(input.saveCard ? { setup_future_usage: "off_session" } : {}),
    });

    if (!intent.client_secret) return { ok: false, error: GENERIC_ERROR };
    return { ok: true, clientSecret: intent.client_secret };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

export type FinalizeOrderResult = { ok: false; error: string };

// Retrieves the PaymentIntent from Stripe (never trusts the client's claim that it succeeded),
// re-verifies it against a freshly recomputed total, then creates the order, decrements stock and
// clears the purchased cart lines in one transaction (CLAUDE.md's Stripe rule). On success this
// redirects and never returns; on failure it returns an error for PaymentStep to show.
export async function finalizeOrder(paymentIntentId: string): Promise<FinalizeOrderResult> {
  const user = await requireUser(ROUTES.checkout);

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["payment_method"] });

  const addressId = typeof intent.metadata.addressId === "string" ? intent.metadata.addressId : "";
  const speed = intent.metadata.speed === "fast" ? "fast" : "standard";
  const buy = intent.metadata.buy || undefined;

  const address = await getAddress(user.id, addressId);
  if (!address || !isUsState(address.state)) return { ok: false, error: ADDRESS_REQUIRED_ERROR };

  const owner = await getCartOwner();
  const source = await resolveCheckoutSource(owner, buy);
  if (source.lines.length === 0) return { ok: false, error: STOCK_ERROR };

  const totals = computeTotals({
    lines: source.lines.map((line) => ({ unitPriceCents: line.unitPriceCents, quantity: line.quantity })),
    speed,
    state: address.state,
  });

  const verify = verifyPaymentForOrder(
    { status: intent.status, amount: intent.amount, metadata: intent.metadata },
    { userId: user.id, totalCents: totals.totalCents },
  );
  if (!verify.ok) return { ok: false, error: PAYMENT_VERIFY_ERROR };

  const paymentMethod = typeof intent.payment_method === "object" ? intent.payment_method : null;
  const card = paymentMethod?.card;
  const paymentBrand = card?.brand ?? "card";
  const paymentLast4 = card?.last4 ?? "0000";

  const orderId = newOrderId();
  const deliveryDateValue = deliveryDate(new Date(), speed);
  const addressSnapshot: AddressSnapshot = {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    zip: address.zip,
  };

  let result;
  try {
    result = await withTransaction((tx) =>
      createOrderFromPayment(tx, {
        orderId,
        userId: user.id,
        speed,
        deliveryDate: deliveryDateValue,
        address: addressSnapshot,
        paymentBrand,
        paymentLast4,
        totals,
        stripePaymentIntentId: intent.id,
        items: source.lines.map((line) => ({
          asin: line.asin,
          title: line.title,
          imageUrl: line.imageUrl,
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
        })),
        cartOwner: source.kind === "cart" ? owner : null,
      }),
    );
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      await stripe.refunds.create({ payment_intent: intent.id });
      return { ok: false, error: STOCK_ERROR };
    }
    throw err;
  }

  if (!result.alreadyExisted && intent.metadata.saveCard === "1" && paymentMethod && card) {
    await addPaymentMethod(user.id, {
      stripePaymentMethodId: paymentMethod.id,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      nameOnCard: paymentMethod.billing_details?.name || user.name,
    });
  }

  revalidatePath("/", "layout");
  redirect(`${ROUTES.checkout}/thankyou/${result.orderId}`);
}
