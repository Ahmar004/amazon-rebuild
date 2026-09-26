import { z } from "zod";
import { ROUTES } from "@/lib/constants/links";

// URL state for /deals: an optional department and a page number. Bad values fall back to the
// defaults instead of throwing, like the search page.
export type DealsQuery = { dept?: string; page: number };

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseDealsParams(raw: Raw): DealsQuery {
  const dept = z.string().trim().min(1).max(60).safeParse(first(raw.dept));
  const page = z.coerce.number().int().min(1).safeParse(first(raw.page));
  return { dept: dept.success ? dept.data : undefined, page: page.success ? page.data : 1 };
}

export function dealsUrl(query: DealsQuery): string {
  const params = new URLSearchParams();
  if (query.dept) params.set("dept", query.dept);
  if (query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${ROUTES.deals}?${qs}` : ROUTES.deals;
}
