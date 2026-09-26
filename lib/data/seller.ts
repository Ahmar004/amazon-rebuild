// Seller dashboard data (frontend-rebuild.md point 15, D4). A sale is an order item whose product
// the seller listed; cancelled orders never count. Every query filters by the seller's id.
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailySeries, type DayTotal } from "@/lib/seller/chart";

export const SALES_CHART_DAYS = 14;
const TOP_LISTINGS = 5;
const RECENT_SALES = 5;
const ATTENTION_LIMIT = 5;

export type SellerStats = { activeListings: number; unitsSold: number; salesCents: number; orders: number };
export type TopListing = { asin: string; title: string; imageUrl: string; units: number; cents: number };
export type RecentSale = {
  orderId: string;
  placedAt: Date;
  asin: string;
  title: string;
  imageUrl: string;
  quantity: number;
  cents: number;
  shipTo: string;
  cancelled: boolean;
};
export type SellerDashboard = {
  stats: SellerStats;
  daily: DayTotal[];
  topListings: TopListing[];
  recentSales: RecentSale[];
  outOfStock: { asin: string; title: string }[];
  hasListings: boolean;
};

// The seller's order items on orders that weren't cancelled.
const SALES = (sellerId: string) => sql`
  from order_items oi
  join orders o on o.id = oi.order_id
  join products p on p.asin = oi.asin
  where p.seller_id = ${sellerId} and o.cancelled_at is null`;

export async function getSellerDashboard(sellerId: string, now: Date): Promise<SellerDashboard> {
  const since = new Date(now.getTime() - SALES_CHART_DAYS * 86_400_000);
  const [stats, daily, top, recent, outOfStock] = await Promise.all([
    db.execute<{ active_listings: number; any_listing: boolean; units_sold: number; sales_cents: number; orders: number }>(sql`
      select
        (select count(*)::int from products where seller_id = ${sellerId} and status = 'active') as active_listings,
        exists (select 1 from products where seller_id = ${sellerId} and status <> 'removed') as any_listing,
        coalesce(sum(oi.quantity), 0)::int as units_sold,
        coalesce(sum(oi.quantity * oi.unit_price_cents), 0)::int as sales_cents,
        count(distinct o.id)::int as orders
      ${SALES(sellerId)}`),
    db.execute<{ day: string; cents: number; units: number }>(sql`
      select to_char(o.placed_at at time zone 'UTC', 'YYYY-MM-DD') as day,
        sum(oi.quantity * oi.unit_price_cents)::int as cents, sum(oi.quantity)::int as units
      ${SALES(sellerId)} and o.placed_at >= ${since.toISOString()}
      group by 1`),
    db.execute<{ asin: string; title: string; image: string | null; units: number; cents: number }>(sql`
      select oi.asin, p.title, p.images->0->>'large' as image,
        sum(oi.quantity)::int as units, sum(oi.quantity * oi.unit_price_cents)::int as cents
      ${SALES(sellerId)}
      group by oi.asin, p.title, p.images
      order by cents desc
      limit ${TOP_LISTINGS}`),
    db.execute<{ order_id: string; placed_at: string; asin: string; title: string; image_url: string; quantity: number; cents: number; city: string; state: string; cancelled_at: string | null }>(sql`
      select o.id as order_id, o.placed_at, oi.asin, oi.title, oi.image_url, oi.quantity,
        oi.quantity * oi.unit_price_cents as cents, o.address->>'city' as city, o.address->>'state' as state, o.cancelled_at
      from order_items oi
      join orders o on o.id = oi.order_id
      join products p on p.asin = oi.asin
      where p.seller_id = ${sellerId}
      order by o.placed_at desc
      limit ${RECENT_SALES}`),
    db.execute<{ asin: string; title: string }>(sql`
      select asin, title from products
      where seller_id = ${sellerId} and status = 'active' and stock = 0
      order by created_at desc
      limit ${ATTENTION_LIMIT}`),
  ]);

  const s = stats.rows[0];
  return {
    stats: { activeListings: s.active_listings, unitsSold: s.units_sold, salesCents: s.sales_cents, orders: s.orders },
    hasListings: s.any_listing,
    daily: dailySeries(daily.rows.map((r) => ({ day: r.day, cents: Number(r.cents), units: Number(r.units) })), SALES_CHART_DAYS, now),
    topListings: top.rows.map((r) => ({ asin: r.asin, title: r.title, imageUrl: r.image ?? "", units: Number(r.units), cents: Number(r.cents) })),
    recentSales: recent.rows.map((r) => ({
      orderId: r.order_id,
      placedAt: new Date(r.placed_at),
      asin: r.asin,
      title: r.title,
      imageUrl: r.image_url,
      quantity: r.quantity,
      cents: Number(r.cents),
      shipTo: `${r.city}, ${r.state}`,
      cancelled: r.cancelled_at !== null,
    })),
    outOfStock: outOfStock.rows,
  };
}
