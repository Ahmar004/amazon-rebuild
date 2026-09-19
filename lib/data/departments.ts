import { asc } from "drizzle-orm";
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
