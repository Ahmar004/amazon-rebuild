// Orders data layer (docs/design.md 5.3, 6.7). createOrderFromPayment runs inside the caller's
// withTransaction (actions/checkout.ts's finalizeOrder) so the order insert, the order-item
// snapshots, the stock decrement and the cart cleanup all succeed or fail together
// (CLAUDE.md: "created in one transaction with the stock decrement and cart cleanup").
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { Tx } from "@/lib/db/client";
import { db, withTransaction } from "@/lib/db/client";
import { cartItems, carts, orderItems, orders, products, users, type AddressSnapshot } from "@/lib/db/schema";
import type { ItemFulfilment } from "@/lib/orders/status";
import { publicName } from "@/lib/users/public-name";
import type { DeliverySpeed } from "@/lib/pricing/shipping";
import type { OrderTotals } from "@/lib/pricing/totals";
import type { CartOwner } from "@/lib/data/cart";
import { mapSummarySqlRow, SUMMARY_COLUMNS, type ProductSummary, type SummarySqlRow } from "@/lib/data/products";

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
      // The last word on availability: enough stock, still listed, and not the buyer's own listing.
      .where(
        and(
          eq(products.asin, item.asin),
          sql`stock >= ${item.quantity} and status = 'active' and seller_id is distinct from ${input.userId}`,
        ),
      )
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

/** An ordered item as the buyer sees it: who sells it and, for a user's listing, how far it has got. */
export type OrderItemView = OrderItemInput & ItemFulfilment & { sellerName: string | null };

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
  items: OrderItemView[];
};

// The items of the given orders, with each product's seller (products.seller_id never changes).
async function itemsOf(orderIds: string[]): Promise<Map<string, OrderItemView[]>> {
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      asin: orderItems.asin,
      title: orderItems.title,
      imageUrl: orderItems.imageUrl,
      unitPriceCents: orderItems.unitPriceCents,
      quantity: orderItems.quantity,
      shippedAt: orderItems.shippedAt,
      deliveredAt: orderItems.deliveredAt,
      sellerId: products.sellerId,
      sellerFullName: users.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.asin, orderItems.asin))
    .leftJoin(users, eq(users.id, products.sellerId))
    .where(inArray(orderItems.orderId, orderIds));
  const byOrder = new Map<string, OrderItemView[]>();
  for (const { orderId, sellerFullName, ...item } of rows) {
    const list = byOrder.get(orderId) ?? [];
    list.push({ ...item, sellerName: sellerFullName === null ? null : publicName(sellerFullName) });
    byOrder.set(orderId, list);
  }
  return byOrder;
}

// Ownership-checked: only returns orders belonging to userId, newest first, for the Your Orders list.
export async function getOrdersForUser(userId: string): Promise<OrderSummary[]> {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.placedAt));
  if (rows.length === 0) return [];

  const itemsByOrder = await itemsOf(rows.map((row) => row.id));

  return rows.map((order) => ({
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
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

// Ownership-checked: only returns an order belonging to userId.
export async function getOrder(userId: string, orderId: string): Promise<OrderSummary | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  if (!order) return null;

  const items = (await itemsOf([orderId])).get(orderId) ?? [];

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
    items,
  };
}

const BUY_AGAIN_LIMIT = 16;

// Products from the user's non-cancelled orders, most recently ordered first (home "Buy again").
export async function getBuyAgain(userId: string): Promise<ProductSummary[]> {
  const result = await db.execute<SummarySqlRow>(sql`
    select ${SUMMARY_COLUMNS}
    from (
      select oi.asin, max(o.placed_at) as last_ordered
      from order_items oi join orders o on o.id = oi.order_id
      where o.user_id = ${userId} and o.cancelled_at is null
      group by oi.asin
    ) bought
    join products p on p.asin = bought.asin
    join categories d on d.id = p.category_id
    where p.status <> 'removed'
    order by bought.last_ordered desc
    limit ${BUY_AGAIN_LIMIT}`);
  return result.rows.map(mapSummarySqlRow);
}

// Ownership-checked: the Stripe PaymentIntent behind one of the user's orders, for a refund.
export async function getOrderPaymentIntentId(userId: string, orderId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: orders.stripePaymentIntentId })
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);
  return row?.id ?? null;
}

export type CancelOutcome = { cancelled: true; asins: string[] } | { cancelled: false; reason: "not_found" | "shipped" };

// Cancels the user's order and puts its stock back (docs/spec.md 6.4, D3). The order row is locked
// first, so a seller can't mark an item shipped while this runs, and `refund` runs inside the
// transaction: if Stripe refuses, nothing is cancelled. A second call finds the order already
// cancelled and does nothing, so stock is only returned once.
export async function cancelOrderAndRestock(userId: string, orderId: string, now: Date, refund: () => Promise<unknown>): Promise<CancelOutcome> {
  return withTransaction(async (tx) => {
    const locked = await tx.execute(sql`select id from orders where id = ${orderId} and user_id = ${userId} and cancelled_at is null for update`);
    if (locked.rows.length === 0) return { cancelled: false, reason: "not_found" };
    const shipped = await tx.execute(sql`select 1 from order_items where order_id = ${orderId} and shipped_at is not null limit 1`);
    if (shipped.rows.length > 0) return { cancelled: false, reason: "shipped" };

    await tx.update(orders).set({ cancelledAt: now }).where(eq(orders.id, orderId));
    const items = await tx.select({ asin: orderItems.asin, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.asin, item.asin));
    }
    await refund();
    return { cancelled: true, asins: items.map((item) => item.asin) };
  });
}
