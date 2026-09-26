import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db/client";
import { mapSummarySqlRow, SUMMARY_COLUMNS, type ProductSummary, type SummarySqlRow } from "@/lib/data/products";
import type { DealsQuery } from "@/lib/validation/deals";

// Today's Deals: every in-stock product selling below its list price, biggest discount first.
export const DEALS_PAGE_SIZE = 24;

export type DealsPage = { items: ProductSummary[]; total: number; departmentCounts: Record<string, number> };

export async function getDeals(query: DealsQuery): Promise<DealsPage> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const isDeal = sql`p.list_price_cents is not null and p.list_price_cents > p.price_cents and p.stock > 0`;
  const inDept = query.dept ? sql`and d.slug = ${query.dept}` : sql``;
  const offset = (query.page - 1) * DEALS_PAGE_SIZE;

  const [rows, counts] = await Promise.all([
    db.execute<SummarySqlRow>(sql`
      select ${SUMMARY_COLUMNS} from products p join departments d on d.id = p.department_id
      where ${isDeal} ${inDept}
      order by (p.list_price_cents - p.price_cents)::float / p.list_price_cents desc, p.rating_count desc nulls last, p.asin
      limit ${DEALS_PAGE_SIZE} offset ${offset}`),
    db.execute<{ slug: string; count: number }>(sql`
      select d.slug, count(*)::int as count from products p join departments d on d.id = p.department_id
      where ${isDeal} group by d.slug`),
  ]);

  const departmentCounts = Object.fromEntries(counts.rows.map((r) => [r.slug, Number(r.count)]));
  const total = query.dept
    ? (departmentCounts[query.dept] ?? 0)
    : Object.values(departmentCounts).reduce((sum, n) => sum + n, 0);
  return { items: rows.rows.map(mapSummarySqlRow), total, departmentCounts };
}
