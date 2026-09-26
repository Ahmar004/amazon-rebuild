// Seller orders (frontend-rebuild.md point 15, D3): the items other shoppers bought from this
// seller, and the two steps the seller moves them through. Every query is limited to products the
// seller listed, so one seller never sees or moves another seller's items.
import { sql } from "drizzle-orm";
import { db, withTransaction } from "@/lib/db/client";
import type { AddressSnapshot } from "@/lib/db/schema";
import { FULFILMENT_STEP, type FulfilmentStep } from "@/lib/constants/seller";
import type { DeliverySpeed } from "@/lib/pricing/shipping";

const SELLER_ORDERS_LIMIT = 200;

export type SoldItem = {
  orderId: string;
  placedAt: Date;
  cancelledAt: Date | null;
  speed: DeliverySpeed;
  deliveryDate: Date;
  address: AddressSnapshot;
  asin: string;
  title: string;
  imageUrl: string;
  quantity: number;
  cents: number;
  shippedAt: Date | null;
  deliveredAt: Date | null;
};

type SoldItemRow = {
  order_id: string;
  placed_at: string;
  cancelled_at: string | null;
  speed: DeliverySpeed;
  delivery_date: string;
  address: AddressSnapshot;
  asin: string;
  title: string;
  image_url: string;
  quantity: number;
  cents: number;
  shipped_at: string | null;
  delivered_at: string | null;
};

const toDate = (value: string | null) => (value === null ? null : new Date(value));

// Newest orders first.
export async function getSoldItems(sellerId: string): Promise<SoldItem[]> {
  const result = await db.execute<SoldItemRow>(sql`
    select o.id as order_id, o.placed_at, o.cancelled_at, o.speed, o.delivery_date, o.address,
      oi.asin, oi.title, oi.image_url, oi.quantity, oi.quantity * oi.unit_price_cents as cents,
      oi.shipped_at, oi.delivered_at
    from order_items oi
    join orders o on o.id = oi.order_id
    join products p on p.asin = oi.asin
    where p.seller_id = ${sellerId}
    order by o.placed_at desc, oi.asin
    limit ${SELLER_ORDERS_LIMIT}`);
  return result.rows.map((row) => ({
    orderId: row.order_id,
    placedAt: new Date(row.placed_at),
    cancelledAt: toDate(row.cancelled_at),
    speed: row.speed,
    deliveryDate: new Date(row.delivery_date),
    address: row.address,
    asin: row.asin,
    title: row.title,
    imageUrl: row.image_url,
    quantity: row.quantity,
    cents: Number(row.cents),
    shippedAt: toDate(row.shipped_at),
    deliveredAt: toDate(row.delivered_at),
  }));
}

// Marks one sold item shipped (only while unshipped) or delivered (only once shipped). The order
// row is locked first, the same lock a buyer's cancel takes, so an item can never ship on an order
// that is being cancelled. Returns false when there was nothing to move.
export async function markSoldItem(sellerId: string, orderId: string, asin: string, step: FulfilmentStep, now: Date): Promise<boolean> {
  return withTransaction(async (tx) => {
    const open = await tx.execute(sql`select id from orders where id = ${orderId} and cancelled_at is null for update`);
    if (open.rows.length === 0) return false;

    const sellerOwns = sql`asin in (select asin from products where seller_id = ${sellerId})`;
    const moved =
      step === FULFILMENT_STEP.shipped
        ? await tx.execute(sql`
            update order_items set shipped_at = ${now.toISOString()}
            where order_id = ${orderId} and asin = ${asin} and shipped_at is null and ${sellerOwns}
            returning asin`)
        : await tx.execute(sql`
            update order_items set delivered_at = ${now.toISOString()}
            where order_id = ${orderId} and asin = ${asin} and shipped_at is not null and delivered_at is null and ${sellerOwns}
            returning asin`);
    return moved.rows.length > 0;
  });
}
