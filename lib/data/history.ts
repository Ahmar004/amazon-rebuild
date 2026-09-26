import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { mapSummarySqlRow, SUMMARY_COLUMNS, type ProductSummary, type SummarySqlRow } from "@/lib/data/products";

// Browsing history (docs/spec.md section 4 "browsing history"). User-owned, so every query is
// scoped to the signed-in user's id and never cached.

export const RECENTLY_VIEWED_LIMIT = 16;

export async function getRecentlyViewed(userId: string, limit: number = RECENTLY_VIEWED_LIMIT): Promise<ProductSummary[]> {
  const result = await db.execute<SummarySqlRow>(sql`
    select ${SUMMARY_COLUMNS}
    from browsing_history h
    join products p on p.asin = h.asin
    join departments d on d.id = p.department_id
    where h.user_id = ${userId}
    order by h.viewed_at desc
    limit ${limit}`);
  return result.rows.map(mapSummarySqlRow);
}
