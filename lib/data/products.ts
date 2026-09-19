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
