// Orders data layer (docs/design.md 5.3, 6.7). createOrderFromPayment runs inside the caller's
// withTransaction (actions/checkout.ts's finalizeOrder) so the order insert, the order-item
// snapshots, the stock decrement and the cart cleanup all succeed or fail together
// (CLAUDE.md: "created in one transaction with the stock decrement and cart cleanup").
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Tx } from "@/lib/db/client";
import { db } from "@/lib/db/client";
import { cartItems, carts, orderItems, orders, products, type AddressSnapshot } from "@/lib/db/schema";
import type { DeliverySpeed } from "@/lib/pricing/shipping";
import type { OrderTotals } from "@/lib/pricing/totals";
import type { CartOwner } from "@/lib/data/cart";

export type OrderItemInput = {
  asin: string;
  title: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
};

export type CreateOrderInput = {
  orderId: string;
  userId: string;
  speed: DeliverySpeed;
  deliveryDate: Date;
  address: AddressSnapshot;
  paymentBrand: string;
  paymentLast4: string;
  totals: OrderTotals;
  stripePaymentIntentId: string;
  items: OrderItemInput[];
  /** The cart to clear the purchased lines from - only set for a cart checkout, not Buy Now. */
  cartOwner: CartOwner | null;
};

export const STOCK_GUARD_ERROR = "Some items are no longer available";

// Thrown to roll back the transaction (a stock guard failed): actions/checkout.ts catches this,
// issues a Stripe refund, and shows the message back on checkout (CLAUDE.md, docs/design.md 6.7).
export class InsufficientStockError extends Error {
  constructor() {
    super(STOCK_GUARD_ERROR);
    this.name = "InsufficientStockError";
  }
}

// Idempotent on stripePaymentIntentId: a replayed finalizeOrder call (e.g. a retried request)
// returns the existing order instead of inserting a duplicate or double-decrementing stock.
export async function createOrderFromPayment(
  tx: Tx,
  input: CreateOrderInput,
): Promise<{ orderId: string; alreadyExisted: boolean }> {
  const [existing] = await tx
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, input.stripePaymentIntentId))
    .limit(1);
  if (existing) return { orderId: existing.id, alreadyExisted: true };

  await tx.insert(orders).values({
    id: input.orderId,
    userId: input.userId,
    speed: input.speed,
    deliveryDate: input.deliveryDate,
    address: input.address,
    paymentBrand: input.paymentBrand,
    paymentLast4: input.paymentLast4,
    itemsCents: input.totals.itemsCents,
    shippingCents: input.totals.shippingCents,
    taxCents: input.totals.taxCents,
    totalCents: input.totals.totalCents,
    stripePaymentIntentId: input.stripePaymentIntentId,
  });

  await tx.insert(orderItems).values(
    input.items.map((item) => ({
      orderId: input.orderId,
      asin: item.asin,
      title: item.title,
      imageUrl: item.imageUrl,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  );

  for (const item of input.items) {
    const result = await tx
      .update(products)
      .set({ stock: sql`stock - ${item.quantity}` })
      .where(and(eq(products.asin, item.asin), sql`stock >= ${item.quantity}`))
      .returning({ asin: products.asin });
    if (result.length === 0) throw new InsufficientStockError();
  }

  if (input.cartOwner) {
    const ownerFilter =
      "userId" in input.cartOwner ? eq(carts.userId, input.cartOwner.userId) : eq(carts.guestToken, input.cartOwner.guestToken);
    const [cart] = await tx.select({ id: carts.id }).from(carts).where(ownerFilter).limit(1);
    if (cart) {
      const asins = input.items.map((item) => item.asin);
      await tx.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), inArray(cartItems.asin, asins)));
    }
  }

  return { orderId: input.orderId, alreadyExisted: false };
}

export type OrderSummary = {
  id: string;
  placedAt: Date;
  speed: DeliverySpeed;
  deliveryDate: Date;
  address: AddressSnapshot;
  paymentBrand: string;
  paymentLast4: string;
  itemsCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  cancelledAt: Date | null;
  items: OrderItemInput[];
};

// Ownership-checked: only returns an order belonging to userId.
export async function getOrder(userId: string, orderId: string): Promise<OrderSummary | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return {
    id: order.id,
    placedAt: order.placedAt,
    speed: order.speed,
    deliveryDate: order.deliveryDate,
    address: order.address,
    paymentBrand: order.paymentBrand,
    paymentLast4: order.paymentLast4,
    itemsCents: order.itemsCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    cancelledAt: order.cancelledAt,
    items: items.map((item) => ({
      asin: item.asin,
      title: item.title,
      imageUrl: item.imageUrl,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  };
}
