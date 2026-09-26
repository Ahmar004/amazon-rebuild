import { z } from "zod";
import { ROUTES } from "@/lib/constants/links";

// URL state for /deals: an optional category and a page number. Bad values fall back to the
// defaults instead of throwing, like the search page.
export type DealsQuery = { category?: string; page: number };

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseDealsParams(raw: Raw): DealsQuery {
  const category = z.string().trim().min(1).max(60).safeParse(first(raw.category));
  const page = z.coerce.number().int().min(1).safeParse(first(raw.page));
  return { category: category.success ? category.data : undefined, page: page.success ? page.data : 1 };
}

export function dealsUrl(query: DealsQuery): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.page > 1) params.set("page", String(query.page));
  const qs = params.toString();
  return qs ? `${ROUTES.deals}?${qs}` : ROUTES.deals;
}
