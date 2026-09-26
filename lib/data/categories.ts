import { asc, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { departments } from "@/lib/db/schema";

export type Department = { id: number; slug: string; name: string };

export async function getDepartments(): Promise<Department[]> {
  "use cache";
  cacheLife("days");
  cacheTag("departments");
  return db
    .select({ id: departments.id, slug: departments.slug, name: departments.name })
    .from(departments)
    .orderBy(asc(departments.sortOrder));
}

export type DepartmentPreview = Department & { images: string[] };

const PREVIEW_IMAGES = 4;

// Every department with the first image of its most-rated products, for the home page's
// department cards (frontend-rebuild.md C6). Real catalogue images only, no marketing creatives.
export async function getDepartmentPreviews(): Promise<DepartmentPreview[]> {
  "use cache";
  cacheLife("days");
  cacheTag("departments", "products");
  const rows = await db.execute<{ id: number; slug: string; name: string; images: string[] | null }>(sql`
    select d.id, d.slug, d.name,
      (select array_agg(p.images->0->>'large' order by p.rating_count desc nulls last)
         from (select images, rating_count from products
               where department_id = d.id and jsonb_array_length(images) > 0
               order by rating_count desc nulls last limit ${PREVIEW_IMAGES}) p) as images
    from departments d
    order by d.sort_order`);
  return rows.rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name, images: r.images ?? [] }));
}
