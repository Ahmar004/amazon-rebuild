import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { listItems, lists, products } from "@/lib/db/schema";
import { mapSummarySqlRow, SUMMARY_COLUMNS, type ProductSummary, type SummarySqlRow } from "@/lib/data/products";

// The wishlist (frontend-rebuild.md C14): one list per user, stored as the user's default row in
// the existing lists tables. Every function takes the session user's id, so a user can only ever
// read or change their own wishlist.

export const WISHLIST_NAME = "Wishlist";

async function findWishlistId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: lists.id })
    .from(lists)
    .where(and(eq(lists.userId, userId), eq(lists.isDefault, true)))
    .orderBy(asc(lists.createdAt))
    .limit(1);
  return row?.id ?? null;
}

async function ensureWishlistId(userId: string): Promise<string> {
  const existing = await findWishlistId(userId);
  if (existing) return existing;
  const [row] = await db.insert(lists).values({ userId, name: WISHLIST_NAME, isDefault: true }).returning({ id: lists.id });
  return row.id;
}

export async function getWishlistAsins(userId: string): Promise<string[]> {
  const result = await db.execute<{ asin: string }>(sql`
    select li.asin from list_items li join lists l on l.id = li.list_id
    where l.user_id = ${userId} and l.is_default
    order by li.added_at desc`);
  return result.rows.map((r) => r.asin);
}

export type WishlistItem = ProductSummary & { priceAtAddCents: number; addedAt: Date };

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const result = await db.execute<SummarySqlRow & { price_at_add_cents: number; added_at: string }>(sql`
    select ${SUMMARY_COLUMNS}, li.price_at_add_cents, li.added_at
    from list_items li
    join lists l on l.id = li.list_id
    join products p on p.asin = li.asin
    join departments d on d.id = p.department_id
    where l.user_id = ${userId} and l.is_default
    order by li.added_at desc`);
  return result.rows.map((row) => ({
    ...mapSummarySqlRow(row),
    priceAtAddCents: row.price_at_add_cents,
    addedAt: new Date(row.added_at),
  }));
}

// Adding twice is a no-op; the price at the moment of adding is kept to show price drops.
export async function addToWishlist(userId: string, asin: string): Promise<void> {
  const [product] = await db.select({ priceCents: products.priceCents }).from(products).where(eq(products.asin, asin)).limit(1);
  if (!product) throw new Error("This item is no longer available.");
  const listId = await ensureWishlistId(userId);
  await db.insert(listItems).values({ listId, asin, priceAtAddCents: product.priceCents }).onConflictDoNothing();
}

export async function removeFromWishlist(userId: string, asin: string): Promise<void> {
  const listId = await findWishlistId(userId);
  if (!listId) return;
  await db.delete(listItems).where(and(eq(listItems.listId, listId), eq(listItems.asin, asin)));
}
