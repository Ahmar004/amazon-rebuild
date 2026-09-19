import { eq, inArray, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { departments, products } from "@/lib/db/schema";

// Contract fixed by docs/superpowers/plans/2026-09-19-slice-3-search.md: later slices (product
// page, cart, orders) depend on this exact shape.
export type ProductSummary = {
  asin: string;
  title: string;
  brand: string;
  departmentSlug: string;
  imageUrl: string;
  priceCents: number;
  listPriceCents: number | null;
  ratingAvg: number;
  ratingCount: number;
  stock: number;
  isBestSeller: boolean;
};

// The row shape produced by a join of products with departments (used by lib/data/search.ts and
// any future data-layer query that needs a ProductSummary).
export type ProductSummaryRow = {
  asin: string;
  title: string;
  brand: string;
  departmentSlug: string;
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
    departmentSlug: row.departmentSlug,
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
  categoryPath: string[];
  departmentName: string;
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
  department_slug: string;
  department_name: string;
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
};

export async function getProduct(asin: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product:${asin}`);

  const result = await db.execute<ProductDetailRow>(sql`
    select p.asin, p.title, p.brand, d.slug as department_slug, d.name as department_name,
           p.category_path, p.price_cents, p.list_price_cents, p.rating_avg, p.rating_count,
           p.rating_counts, p.stock, p.is_best_seller, p.features, p.description, p.details, p.images
    from products p
    join departments d on d.id = p.department_id
    where p.asin = ${asin}
  `);
  const row = result.rows[0];
  if (!row) return null;

  const summary = mapProductSummaryRow({
    asin: row.asin,
    title: row.title,
    brand: row.brand,
    departmentSlug: row.department_slug,
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
    categoryPath: row.category_path,
    departmentName: row.department_name,
    features: row.features,
    description: row.description,
    details: row.details,
    images: (row.images as ProductImage[] | null) ?? [],
    ratingCounts: row.rating_counts,
  };
}

// Up to 40 products from the same department (excluding this one), ordered by rating count.
// A pure function (splitRelatedCarousels below) then slices this into the two carousels, so the
// split logic is testable without a database.
const RELATED_FETCH_LIMIT = 40;

type RelatedRow = {
  asin: string;
  title: string;
  brand: string;
  department_slug: string;
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
  departmentSlug: string,
  limit: number = RELATED_FETCH_LIMIT,
): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const result = await db.execute<RelatedRow>(sql`
    select p.asin, p.title, p.brand, d.slug as department_slug, p.images, p.price_cents,
           p.list_price_cents, p.rating_avg, p.rating_count, p.stock, p.is_best_seller
    from products p
    join departments d on d.id = p.department_id
    where d.slug = ${departmentSlug} and p.asin != ${asin}
    order by p.rating_count desc
    limit ${limit}
  `);

  return result.rows.map((row) =>
    mapProductSummaryRow({
      asin: row.asin,
      title: row.title,
      brand: row.brand,
      departmentSlug: row.department_slug,
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
// next 20 in the same order, or - when the department is too small for a full second page -
// whatever is left, re-sorted by price proximity to this product (plan: "the same department
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
    sql`select asin from products order by rating_count desc limit ${n}`,
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
      departmentSlug: departments.slug,
      images: products.images,
      priceCents: products.priceCents,
      listPriceCents: products.listPriceCents,
      ratingAvg: products.ratingAvg,
      ratingCount: products.ratingCount,
      stock: products.stock,
      isBestSeller: products.isBestSeller,
    })
    .from(products)
    .innerJoin(departments, eq(departments.id, products.departmentId))
    .where(inArray(products.asin, asins));

  return rows.map(mapProductSummaryRow);
}
