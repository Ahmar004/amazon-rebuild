// Seller listings (frontend-rebuild.md point 15, D2). A listing is a row in `products` with the
// seller's id, so it joins search, product pages, carts and checkout without a second code path.
// Every read and write filters by the seller's id in SQL, so one seller can never touch another
// seller's listing.
import { randomBytes } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, withTransaction } from "@/lib/db/client";
import { browsingHistory, cartItems, categories, listItems, orderItems, products, reviews } from "@/lib/db/schema";
import { LISTING_ID_PREFIX, LISTING_STATUS, type ListingStatus } from "@/lib/constants/listings";
import { listingImages } from "@/lib/listings/photos";
import type { ListingInput } from "@/lib/validation/listing";

const ID_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

// "L" plus 9 random characters: the same length as a catalogue product id, never the same prefix.
export function newListingId(): string {
  const bytes = randomBytes(9);
  return LISTING_ID_PREFIX + Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join("");
}

async function categoryBySlug(slug: string): Promise<{ id: number; name: string } | null> {
  const [row] = await db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

function productFields(input: ListingInput, sellerName: string, category: { id: number; name: string }) {
  return {
    title: input.title,
    brand: input.brand ?? sellerName,
    categoryId: category.id,
    categoryPath: [category.name],
    priceCents: input.priceCents,
    listPriceCents: input.listPriceCents,
    stock: input.stock,
    features: input.features,
    description: input.description,
    images: listingImages(input.photos),
  };
}

export type ListingWriteResult = { ok: true; asin: string } | { ok: false; reason: "category" | "not_found" };

export async function createListing(sellerId: string, sellerName: string, input: ListingInput): Promise<ListingWriteResult> {
  const category = await categoryBySlug(input.categorySlug);
  if (!category) return { ok: false, reason: "category" };

  const asin = newListingId();
  await db.insert(products).values({
    asin,
    ...productFields(input, sellerName, category),
    sellerId,
    ratingCounts: [0, 0, 0, 0, 0],
    details: {},
    // The newest listing sorts first under "Newest Arrivals" (imported_rank desc).
    importedRank: sql`(select coalesce(max(imported_rank), 0) + 1 from products)`,
  });
  return { ok: true, asin };
}

// Returns the photo URLs the edit dropped, so the caller can delete them from the Blob store.
export async function updateListing(
  sellerId: string,
  sellerName: string,
  asin: string,
  input: ListingInput,
): Promise<{ ok: true; asin: string; removedPhotos: string[] } | { ok: false; reason: "category" | "not_found" }> {
  const category = await categoryBySlug(input.categorySlug);
  if (!category) return { ok: false, reason: "category" };

  const existing = await getOwnListing(sellerId, asin);
  if (!existing) return { ok: false, reason: "not_found" };

  await db
    .update(products)
    .set(productFields(input, sellerName, category))
    .where(and(eq(products.asin, asin), eq(products.sellerId, sellerId)));
  return { ok: true, asin, removedPhotos: existing.photos.filter((url) => !input.photos.includes(url)) };
}

// Pause or resume. A removed listing stays removed.
export async function setListingStatus(sellerId: string, asin: string, status: "active" | "paused"): Promise<boolean> {
  const rows = await db
    .update(products)
    .set({ status })
    .where(and(eq(products.asin, asin), eq(products.sellerId, sellerId), sql`${products.status} <> 'removed'`))
    .returning({ asin: products.asin });
  return rows.length > 0;
}

export type DeleteListingResult = { deleted: false } | { deleted: true; hardDeleted: boolean; photos: string[] };

// A listing nobody has ordered is deleted with everything that points at it. One with orders is
// only marked removed, so buyers' orders and the seller's sales keep their product row. Either way
// it leaves every cart, wishlist and browsing history at once.
export async function deleteListing(sellerId: string, asin: string): Promise<DeleteListingResult> {
  return withTransaction(async (tx) => {
    const [listing] = await tx
      .select({ images: products.images })
      .from(products)
      .where(and(eq(products.asin, asin), eq(products.sellerId, sellerId), sql`${products.status} <> 'removed'`))
      .limit(1);
    if (!listing) return { deleted: false };

    await tx.delete(cartItems).where(eq(cartItems.asin, asin));
    await tx.delete(listItems).where(eq(listItems.asin, asin));
    await tx.delete(browsingHistory).where(eq(browsingHistory.asin, asin));

    const [ordered] = await tx.select({ asin: orderItems.asin }).from(orderItems).where(eq(orderItems.asin, asin)).limit(1);
    if (ordered) {
      await tx.update(products).set({ status: LISTING_STATUS.removed }).where(eq(products.asin, asin));
      return { deleted: true, hardDeleted: false, photos: [] };
    }

    await tx.delete(reviews).where(eq(reviews.asin, asin));
    await tx.delete(products).where(eq(products.asin, asin));
    return { deleted: true, hardDeleted: true, photos: listing.images.map((image) => image.large) };
  });
}

export type OwnListing = {
  asin: string;
  title: string;
  brand: string;
  categorySlug: string;
  priceCents: number;
  listPriceCents: number | null;
  stock: number;
  description: string;
  features: string[];
  photos: string[];
  status: ListingStatus;
};

// The seller's own listing, for the edit form. Removed listings can't be edited.
export async function getOwnListing(sellerId: string, asin: string): Promise<OwnListing | null> {
  const [row] = await db
    .select({
      asin: products.asin,
      title: products.title,
      brand: products.brand,
      categorySlug: categories.slug,
      priceCents: products.priceCents,
      listPriceCents: products.listPriceCents,
      stock: products.stock,
      description: products.description,
      features: products.features,
      images: products.images,
      status: products.status,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(and(eq(products.asin, asin), eq(products.sellerId, sellerId), sql`${products.status} <> 'removed'`))
    .limit(1);
  if (!row) return null;
  const { images, ...rest } = row;
  return { ...rest, photos: images.map((image) => image.large) };
}

export type SellerListingRow = {
  asin: string;
  title: string;
  imageUrl: string;
  priceCents: number;
  stock: number;
  status: ListingStatus;
  createdAt: Date;
  unitsSold: number;
};

// "Your listings": every listing the seller hasn't deleted, newest first, with units sold on
// orders that weren't cancelled.
export async function getSellerListings(sellerId: string): Promise<SellerListingRow[]> {
  const rows = await db
    .select({
      asin: products.asin,
      title: products.title,
      images: products.images,
      priceCents: products.priceCents,
      stock: products.stock,
      status: products.status,
      createdAt: products.createdAt,
      unitsSold: sql<number>`coalesce((
        select sum(oi.quantity) from order_items oi join orders o on o.id = oi.order_id
        where oi.asin = ${products.asin} and o.cancelled_at is null), 0)`.mapWith(Number),
    })
    .from(products)
    .where(and(eq(products.sellerId, sellerId), sql`${products.status} <> 'removed'`))
    .orderBy(desc(products.createdAt));
  return rows.map(({ images, ...row }) => ({ ...row, imageUrl: images[0]?.large ?? "" }));
}
