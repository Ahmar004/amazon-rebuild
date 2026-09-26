import { eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { categories, products } from "@/lib/db/schema";
import { LISTING_STATUS, type ListingStatus } from "@/lib/constants/listings";
import { publicName } from "@/lib/users/public-name";

// Only active products can be bought: a paused or removed listing reads as out of stock
// everywhere stock is shown or checked (cart, checkout, purchase panel).
export const AVAILABLE_STOCK = sql<number>`(case when ${products.status} = 'active' then ${products.stock} else 0 end)`.mapWith(Number);
/** The same rule for raw SQL over `products p`, plus the filter that keeps other listings out of lists. */
export const AVAILABLE_STOCK_P = sql`(case when p.status = 'active' then p.stock else 0 end)`;
export const LISTED_P = sql`p.status = 'active'`;

// Contract fixed by docs/superpowers/plans/2026-09-19-slice-3-search.md: later slices (product
// page, cart, orders) depend on this exact shape.
export type ProductSummary = {
  asin: string;
  title: string;
  brand: string;
  categorySlug: string;
  imageUrl: string;
  priceCents: number;
  listPriceCents: number | null;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  isBestSeller: boolean;
};

// The row shape produced by a join of products with categories (used by lib/data/search.ts and
// any future data-layer query that needs a ProductSummary).
export type ProductSummaryRow = {
  asin: string;
  title: string;
  brand: string;
  categorySlug: string;
  images: unknown;
  priceCents: number;
  listPriceCents: number | null;
  ratingAvg: number | string | null;
  ratingCount: number | null;
  stock: number;
  isBestSeller: boolean;
};

// ProductSummary.imageUrl is the first image's "large" URL, unresized; callers apply
// lib/assets.ts's imageAt() for the size their surface needs (plan: ResultRow uses UL320).
function firstImageUrl(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0] as { large?: string } | undefined;
    if (first?.large) return first.large;
  }
  return "";
}

export function mapProductSummaryRow(row: ProductSummaryRow): ProductSummary {
  return {
    asin: row.asin,
    title: row.title,
    brand: row.brand,
    categorySlug: row.categorySlug,
    imageUrl: firstImageUrl(row.images),
    priceCents: row.priceCents,
    listPriceCents: row.listPriceCents,
    ratingAvg: row.ratingAvg === null ? 0 : Number(row.ratingAvg),
    ratingCount: row.ratingCount ?? 0,
    stock: row.stock,
    isBestSeller: row.isBestSeller,
  };
}

// Slice 4 (product page). Contract fixed by
// docs/superpowers/plans/2026-09-19-slice-4-product.md.
export type ProductImage = { thumb: string; large: string; hiRes: string | null };

export type ProductDetail = ProductSummary & {
  /** The user who listed it, or null when Shopeedo sells it. */
  sellerId: string | null;
  /** Public seller name ("First L."), or null when Shopeedo sells it. */
  sellerName: string | null;
  status: ListingStatus;
  categoryPath: string[];
  categoryName: string;
  features: string[];
  description: string;
  details: Record<string, string>;
  images: ProductImage[];
  ratingCounts: number[];
};

type ProductDetailRow = {
  asin: string;
  title: string;
  brand: string;
  category_slug: string;
  category_name: string;
  category_path: string[];
  price_cents: number;
  list_price_cents: number | null;
  rating_avg: string | number | null;
  rating_count: number | null;
  rating_counts: number[];
  stock: number;
  is_best_seller: boolean;
  features: string[];
  description: string;
  details: Record<string, string>;
  images: unknown;
  seller_id: string | null;
  seller_full_name: string | null;
  status: ListingStatus;
};

export async function getProduct(asin: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product:${asin}`);

  const result = await db.execute<ProductDetailRow>(sql`
    select p.asin, p.title, p.brand, d.slug as category_slug, d.name as category_name,
           p.category_path, p.price_cents, p.list_price_cents, p.rating_avg, p.rating_count,
           p.rating_counts, ${AVAILABLE_STOCK_P} as stock, p.is_best_seller, p.features, p.description,
           p.details, p.images, p.seller_id, u.name as seller_full_name, p.status
    from products p
    join categories d on d.id = p.category_id
    left join users u on u.id = p.seller_id
    where p.asin = ${asin}
  `);
  const row = result.rows[0];
  // A deleted listing that still has orders stays in the table but is gone from the store.
  if (!row || row.status === LISTING_STATUS.removed) return null;

  const summary = mapProductSummaryRow({
    asin: row.asin,
    title: row.title,
    brand: row.brand,
    categorySlug: row.category_slug,
    images: row.images,
    priceCents: row.price_cents,
    listPriceCents: row.list_price_cents,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    stock: row.stock,
    isBestSeller: row.is_best_seller,
  });

  return {
    ...summary,
    sellerId: row.seller_id,
    sellerName: row.seller_full_name === null ? null : publicName(row.seller_full_name),
    status: row.status,
    categoryPath: row.category_path,
    categoryName: row.category_name,
    features: row.features,
    description: row.description,
    details: row.details,
    images: (row.images as ProductImage[] | null) ?? [],
    ratingCounts: row.rating_counts,
  };
}

// Up to 40 products from the same category (excluding this one), ordered by rating count.
// A pure function (splitRelatedCarousels below) then slices this into the two carousels, so the
// split logic is testable without a database.
const RELATED_FETCH_LIMIT = 40;

type RelatedRow = {
  asin: string;
  title: string;
  brand: string;
  category_slug: string;
  images: unknown;
  price_cents: number;
  list_price_cents: number | null;
  rating_avg: string | number | null;
  rating_count: number | null;
  stock: number;
  is_best_seller: boolean;
};

export async function getRelated(
  asin: string,
  categorySlug: string,
  limit: number = RELATED_FETCH_LIMIT,
): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const result = await db.execute<RelatedRow>(sql`
    select p.asin, p.title, p.brand, d.slug as category_slug, p.images, p.price_cents,
           p.list_price_cents, p.rating_avg, p.rating_count, p.stock, p.is_best_seller
    from products p
    join categories d on d.id = p.category_id
    where d.slug = ${categorySlug} and p.asin != ${asin} and ${LISTED_P}
    order by p.rating_count desc
    limit ${limit}
  `);

  return result.rows.map((row) =>
    mapProductSummaryRow({
      asin: row.asin,
      title: row.title,
      brand: row.brand,
      categorySlug: row.category_slug,
      images: row.images,
      priceCents: row.price_cents,
      listPriceCents: row.list_price_cents,
      ratingAvg: row.rating_avg,
      ratingCount: row.rating_count,
      stock: row.stock,
      isBestSeller: row.is_best_seller,
    }),
  );
}

const ALSO_VIEWED_SIZE = 20;
const RELATED_SIZE = 20;

// Splits getRelated's up-to-40 items (already ordered by rating count) between the two
// carousels: "Customers also viewed" gets the first 20; "Products related to this item" gets the
// next 20 in the same order, or - when the category is too small for a full second page -
// whatever is left, re-sorted by price proximity to this product (plan: "the same category
// sorted by price proximity").
export function splitRelatedCarousels(
  items: ProductSummary[],
  priceCents: number,
): { alsoViewed: ProductSummary[]; related: ProductSummary[] } {
  const alsoViewed = items.slice(0, ALSO_VIEWED_SIZE);
  const rest = items.slice(ALSO_VIEWED_SIZE, ALSO_VIEWED_SIZE + RELATED_SIZE);
  const related =
    rest.length >= RELATED_SIZE
      ? rest
      : [...rest].sort((a, b) => Math.abs(a.priceCents - priceCents) - Math.abs(b.priceCents - priceCents));
  return { alsoViewed, related };
}

const TOP_ASINS_DEFAULT = 200;

// The most-rated products, for generateStaticParams (plan: prerender the 200 with the most
// ratings; other ASINs render on demand and are then cached).
export async function getTopAsins(n: number = TOP_ASINS_DEFAULT): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const result = await db.execute<{ asin: string }>(
    sql`select asin from products where status = 'active' order by rating_count desc limit ${n}`,
  );
  return result.rows.map((row) => row.asin);
}

// Live (uncached) lookup for a set of ASINs, used by lib/checkout/source.ts's Buy Now path where
// stock must be current at the moment of payment, not a cached snapshot up to an hour old.
export async function getProductsByAsins(asins: string[]): Promise<ProductSummary[]> {
  if (asins.length === 0) return [];

  const rows = await db
    .select({
      asin: products.asin,
      title: products.title,
      brand: products.brand,
      categorySlug: categories.slug,
      images: products.images,
      priceCents: products.priceCents,
      listPriceCents: products.listPriceCents,
      ratingAvg: products.ratingAvg,
      ratingCount: products.ratingCount,
      stock: AVAILABLE_STOCK,
      isBestSeller: products.isBestSeller,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(inArray(products.asin, asins));

  return rows.map(mapProductSummaryRow);
}

// The ProductSummary columns for raw SQL over `products p join categories d`, with only the
// first image (rails and grids never need the rest). Pair with mapSummarySqlRow.
export const SUMMARY_COLUMNS = sql`p.asin, p.title, p.brand, d.slug as category_slug,
  jsonb_build_array(p.images->0) as images, p.price_cents, p.list_price_cents, p.rating_avg,
  p.rating_count, (case when p.status = 'active' then p.stock else 0 end) as stock, p.is_best_seller`;

export type SummarySqlRow = {
  asin: string;
  title: string;
  brand: string;
  category_slug: string;
  images: unknown;
  price_cents: number;
  list_price_cents: number | null;
  rating_avg: string | number | null;
  rating_count: number | null;
  stock: number;
  is_best_seller: boolean;
};

export function mapSummarySqlRow(row: SummarySqlRow): ProductSummary {
  return mapProductSummaryRow({
    asin: row.asin,
    title: row.title,
    brand: row.brand,
    categorySlug: row.category_slug,
    images: row.images,
    priceCents: row.price_cents,
    listPriceCents: row.list_price_cents,
    ratingAvg: row.rating_avg,
    ratingCount: row.rating_count,
    stock: row.stock,
    isBestSeller: row.is_best_seller,
  });
}
