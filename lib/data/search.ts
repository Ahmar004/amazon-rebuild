import { sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { mapProductSummaryRow, type ProductSummary } from "@/lib/data/products";
import type { SearchQuery } from "@/lib/validation/search";
import type { SortKey } from "@/lib/constants/sort";

export const PAGE_SIZE = 24; // divides evenly into 2, 3 and 4 grid columns

export type SearchResult = {
  total: number;
  items: ProductSummary[];
  brandFacets: { name: string; count: number }[];
  category: { slug: string; name: string } | null;
};

// Flattens a drizzle SQL fragment's literal string chunks into readable text, so a unit test can
// assert which column a condition touches without a database connection. Params (interpolated
// values) are rendered as "?"; only the hardcoded column/operator text in the template survives,
// which is all buildSearchConditions ever puts in those literal chunks.
export function sqlText(fragment: SQL): string {
  const chunks = (fragment as unknown as { queryChunks: unknown[] }).queryChunks;
  return chunks
    .map((chunk) => {
      if (chunk && typeof chunk === "object" && "value" in chunk && Array.isArray((chunk as { value: unknown }).value)) {
        return (chunk as { value: string[] }).value.join("");
      }
      if (chunk && typeof chunk === "object" && "queryChunks" in chunk) {
        return sqlText(chunk as SQL);
      }
      return "?";
    })
    .join("");
}

type BuildOptions = { forFacets?: boolean };

// Pure WHERE-clause builder (design 6.3): kept separate from searchProducts so
// tests/unit/data/search-query.test.ts can check each filter's condition without a database.
export function buildSearchConditions(q: SearchQuery, options: BuildOptions = {}): SQL[] {
  const conditions: SQL[] = [];

  if (q.k) {
    conditions.push(sql`search_vector @@ websearch_to_tsquery('english', ${q.k})`);
  }
  if (q.category) {
    conditions.push(sql`category_id = (select id from categories where slug = ${q.category})`);
  }
  if (q.minRating) {
    conditions.push(sql`rating_avg >= ${q.minRating}`);
  }
  if (!options.forFacets && q.brands.length > 0) {
    const brandList = sql.join(
      q.brands.map((brand) => sql`${brand}`),
      sql`, `,
    );
    conditions.push(sql`brand in (${brandList})`);
  }
  if (q.pminCents !== undefined) {
    conditions.push(sql`price_cents >= ${q.pminCents}`);
  }
  if (q.pmaxCents !== undefined) {
    conditions.push(sql`price_cents <= ${q.pmaxCents}`);
  }
  if (q.dealsOnly) {
    conditions.push(sql`list_price_cents is not null and list_price_cents > price_cents`);
  }

  return conditions;
}

// Sort map (design 6.3).
export function buildSearchOrderBy(sortKey: SortKey): SQL {
  switch (sortKey) {
    case "price-asc":
      return sql`price_cents asc`;
    case "price-desc":
      return sql`price_cents desc`;
    case "review":
      return sql`rating_avg desc, rating_count desc`;
    case "newest":
      return sql`imported_rank desc`;
    case "bestsellers":
      return sql`is_best_seller desc, rating_count desc`;
    case "featured":
    default:
      return sql`ts_rank(search_vector, websearch_to_tsquery('english', '')) desc, rating_count desc`;
  }
}

function whereClause(conditions: SQL[]): SQL {
  return conditions.length > 0 ? sql.join(conditions, sql` and `) : sql`true`;
}

export async function searchProducts(q: SearchQuery): Promise<SearchResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag("search");

  const conditions = buildSearchConditions(q);
  const where = whereClause(conditions);
  const orderBy = buildSearchOrderBy(q.sort);
  const offset = (q.page - 1) * PAGE_SIZE;

  const totalResult = await db.execute<{ total: number }>(
    sql`select count(*)::int as total from products where ${where}`,
  );
  const total = totalResult.rows[0]?.total ?? 0;

  const rowsResult = await db.execute<{
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
  }>(sql`
    select p.asin, p.title, p.brand, d.slug as category_slug, p.images, p.price_cents,
           p.list_price_cents, p.rating_avg, p.rating_count, p.stock, p.is_best_seller
    from products p
    join categories d on d.id = p.category_id
    where ${where}
    order by ${orderBy}
    limit ${PAGE_SIZE} offset ${offset}
  `);
  const rows = rowsResult.rows;

  const items = rows.map((row) =>
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

  const facetConditions = buildSearchConditions(q, { forFacets: true });
  const facetWhere = whereClause(facetConditions);
  const brandFacetResult = await db.execute<{ brand: string; count: number }>(sql`
    select brand, count(*)::int as count
    from products
    where ${facetWhere}
    group by brand
    order by count desc
    limit 30
  `);
  const brandFacetRows = brandFacetResult.rows;

  const category = q.category
    ? await db
        .select({ slug: categories.slug, name: categories.name })
        .from(categories)
        .where(sql`slug = ${q.category}`)
        .then((rows2) => rows2[0] ?? null)
    : null;

  return {
    total: Number(total),
    items,
    brandFacets: brandFacetRows.map((r) => ({ name: r.brand, count: Number(r.count) })),
    category,
  };
}

const SUGGEST_MIN_LENGTH = 2;
const SUGGEST_LIMIT = 10;

export async function suggest(prefix: string): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("search");

  const trimmed = prefix.trim();
  if (trimmed.length < SUGGEST_MIN_LENGTH) return [];

  const result = await db.execute<{ suggestion: string }>(sql`
    select suggestion
    from (
      select lower(left(title, 60)) as suggestion, word_similarity(${trimmed}, title) as similarity
      from products
      where ${trimmed} <% title
    ) matches
    group by suggestion
    order by max(similarity) desc
    limit ${SUGGEST_LIMIT}
  `);

  return result.rows.map((r) => r.suggestion);
}
