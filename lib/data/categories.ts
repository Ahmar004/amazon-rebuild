import { asc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";

export type Category = { id: number; slug: string; name: string };

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories");
  return db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
}

export type CategoryPreview = Category & { images: string[] };

const PREVIEW_IMAGES = 4;

// Every category with the first image of its most-rated products, for the home page's
// category cards (frontend-rebuild.md C6). Real catalogue images only, no marketing creatives.
export async function getCategoryPreviews(): Promise<CategoryPreview[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories", "products");
  const rows = await db.execute<{ id: number; slug: string; name: string; images: string[] | null }>(sql`
    select d.id, d.slug, d.name,
      (select array_agg(p.images->0->>'large' order by p.rating_count desc nulls last)
         from (select images, rating_count from products
               where category_id = d.id and jsonb_array_length(images) > 0
               order by rating_count desc nulls last limit ${PREVIEW_IMAGES}) p) as images
    from categories d
    order by d.sort_order`);
  return rows.rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, images: r.images ?? [] }));
}
