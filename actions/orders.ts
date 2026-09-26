"use server";

// Cancelling an order (docs/spec.md 6.4, frontend-rebuild.md C16, D3): allowed only before any item
// ships. The refund runs inside the cancel transaction (lib/data/orders.ts), with an idempotency
// key, so the order is only cancelled once Stripe has accepted the refund and a retry never
// refunds twice.
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { cancelOrderAndRestock, getOrder, getOrderPaymentIntentId } from "@/lib/data/orders";
import { canCancel } from "@/lib/orders/status";
import { stripe } from "@/lib/stripe";
import { ROUTES } from "@/lib/constants/links";

type CancelResult = { ok: true } | { ok: false; error: string };

const orderIdSchema = z.string().trim().min(1).max(40);
const NOT_FOUND = "We couldn't find that order.";

export async function cancelOrder(orderId: string): Promise<CancelResult> {
  const parsed = orderIdSchema.safeParse(orderId);
  if (!parsed.success) return { ok: false, error: NOT_FOUND };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const order = await getOrder(user.id, parsed.data);
  if (!order) return { ok: false, error: NOT_FOUND };

  const now = new Date();
  if (!canCancel(order, now)) return { ok: false, error: "This order has already shipped, so it can no longer be cancelled." };


  const shippedError = { ok: false, error: "This order has already shipped, so it can no longer be cancelled." } as const;
  try {
    const paymentIntentId = await getOrderPaymentIntentId(user.id, order.id);
    if (!paymentIntentId) return { ok: false, error: NOT_FOUND };
    const outcome = await cancelOrderAndRestock(user.id, order.id, now, () =>
      stripe.refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `cancel-${order.id}` }),
    );
    if (!outcome.cancelled) return outcome.reason === "shipped" ? shippedError : { ok: false, error: NOT_FOUND };
    for (const asin of outcome.asins) updateTag(`product:${asin}`);
  } catch {
    return { ok: false, error: "We couldn't cancel this order. Please try again." };
  }

  revalidatePath(ROUTES.orders, "layout");
  return { ok: true };
}
