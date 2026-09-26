import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { mapSummarySqlRow, SUMMARY_COLUMNS, type ProductSummary, type SummarySqlRow } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import {
  CATEGORY_RAIL_SIZE,
  HERO_IMAGES_PER_SLIDE,
  HERO_SLIDES,
  RAIL_SIZE,
  type HeroSlideConfig,
} from "@/lib/constants/home";

// Catalogue reads for the home page (frontend-rebuild.md C6). Everything here is shared, cached
// catalogue data; the signed-in rails (recently viewed, buy again) live with their own tables.

// Only active products with a photo appear on the home page.
const HAS_IMAGE = sql`jsonb_array_length(p.images) > 0 and p.status = 'active'`;
const DISCOUNT = sql`(p.list_price_cents - p.price_cents)::float / p.list_price_cents`;
const IS_DEAL = sql`p.list_price_cents is not null and p.list_price_cents > p.price_cents`;

export type HeroSlide = HeroSlideConfig & { images: string[] };

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("days");
  cacheTag("products");

  const slugs = HERO_SLIDES.flatMap((s) => (s.categorySlug ? [s.categorySlug] : []));
  const [byCategory, deals] = await Promise.all([
    db.execute<{ slug: string; image: string }>(sql`
      select slug, image from (
        select d.slug, p.images->0->>'large' as image,
          row_number() over (partition by d.id order by p.rating_count desc nulls last) as rn
        from products p join categories d on d.id = p.category_id
        where ${HAS_IMAGE} and d.slug in (${sql.join(slugs.map((s) => sql`${s}`), sql`, `)})
      ) ranked
      where rn <= ${HERO_IMAGES_PER_SLIDE}
      order by slug, rn`),
    db.execute<{ image: string }>(sql`
      select p.images->0->>'large' as image from products p
      where ${HAS_IMAGE} and ${IS_DEAL} and p.rating_count >= 50
      order by ${DISCOUNT} desc, p.rating_count desc
      limit ${HERO_IMAGES_PER_SLIDE}`),
  ]);

  const images = new Map<string, string[]>();
  for (const row of byCategory.rows) images.set(row.slug, [...(images.get(row.slug) ?? []), row.image]);

  return HERO_SLIDES.map((slide) => ({
    ...slide,
    images: slide.categorySlug ? (images.get(slide.categorySlug) ?? []) : deals.rows.map((r) => r.image),
  }));
}

// Biggest discounts first, among products with enough ratings to be worth showing.
export async function getDealsRail(): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const result = await db.execute<SummarySqlRow>(sql`
    select ${SUMMARY_COLUMNS} from products p join categories d on d.id = p.category_id
    where ${HAS_IMAGE} and ${IS_DEAL} and p.stock > 0 and p.rating_count >= 20
    order by ${DISCOUNT} desc, p.rating_count desc
    limit ${RAIL_SIZE}`);
  return result.rows.map(mapSummarySqlRow);
}

export async function getBestSellersRail(): Promise<ProductSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const result = await db.execute<SummarySqlRow>(sql`
    select ${SUMMARY_COLUMNS} from products p join categories d on d.id = p.category_id
    where ${HAS_IMAGE} and p.is_best_seller and p.stock > 0
    order by p.rating_count desc nulls last
    limit ${RAIL_SIZE}`);
  return result.rows.map(mapSummarySqlRow);
}

export type CategoryRail = { category: Category; items: ProductSummary[] };

// One rail per category, each holding its most-rated products, in one query.
export async function getCategoryRails(): Promise<CategoryRail[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "categories");
  const result = await db.execute<SummarySqlRow & { category_id: number; category_name: string }>(sql`
    select d.id as category_id, d.name as category_name, ${SUMMARY_COLUMNS}
    from (
      select p.*, row_number() over (partition by p.category_id order by p.rating_count desc nulls last) as rn
      from products p
      where ${HAS_IMAGE} and p.stock > 0
    ) p
    join categories d on d.id = p.category_id
    where p.rn <= ${CATEGORY_RAIL_SIZE}
    order by d.sort_order, p.rn`);

  const rails: CategoryRail[] = [];
  for (const row of result.rows) {
    let rail = rails.at(-1);
    if (!rail || rail.category.id !== row.category_id) {
      rail = { category: { id: row.category_id, slug: row.category_slug, name: row.category_name }, items: [] };
      rails.push(rail);
    }
    rail.items.push(mapSummarySqlRow(row));
  }
  return rails;
}
