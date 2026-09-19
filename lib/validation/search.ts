import { z } from "zod";
import { DEFAULT_SORT, SORT_KEYS, type SortKey } from "@/lib/constants/sort";

export type SearchQuery = {
  k?: string;
  dept?: string;
  minRating?: number;
  brands: string[];
  pminCents?: number;
  pmaxCents?: number;
  dealsOnly: boolean;
  sort: SortKey;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const stringSchema = z.string().trim().min(1);
const ratingSchema = z.coerce.number().int().min(1).max(4);
const sortSchema = z.enum(SORT_KEYS as [SortKey, ...SortKey[]]);
const pageSchema = z.coerce.number().int().min(1);
const dollarsSchema = z.coerce.number().nonnegative();

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Parses one field with Zod and falls back to undefined instead of throwing, per
// docs/superpowers/plans/2026-09-19-slice-3-search.md: "Invalid values fall back to the
// defaults and never throw."
function safe<T>(schema: z.ZodType<T>, value: unknown): T | undefined {
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
}

export function parseSearchParams(raw: RawSearchParams): SearchQuery {
  const pminDollars = safe(dollarsSchema, first(raw.pmin));
  const pmaxDollars = safe(dollarsSchema, first(raw.pmax));

  return {
    k: safe(stringSchema, first(raw.k)),
    dept: safe(stringSchema, first(raw.i)),
    minRating: safe(ratingSchema, first(raw.rating)),
    brands: toArray(raw.brand).filter((b): b is string => typeof b === "string" && b.length > 0),
    pminCents: pminDollars !== undefined ? Math.round(pminDollars * 100) : undefined,
    pmaxCents: pmaxDollars !== undefined ? Math.round(pmaxDollars * 100) : undefined,
    dealsOnly: first(raw.deals) === "1",
    sort: safe(sortSchema, first(raw.sort)) ?? DEFAULT_SORT,
    page: safe(pageSchema, first(raw.page)) ?? 1,
  };
}

// Rebuilds the /s URL for a filter link: the current query plus a patch. Changing any filter
// resets the page to 1, unless the patch itself is a page change (pagination links).
export function toSearchUrl(query: SearchQuery, patch: Partial<SearchQuery>): string {
  const merged: SearchQuery = { ...query, ...patch };
  if (!("page" in patch)) merged.page = 1;

  const params = new URLSearchParams();
  if (merged.k) params.set("k", merged.k);
  if (merged.dept) params.set("i", merged.dept);
  if (merged.minRating) params.set("rating", String(merged.minRating));
  for (const brand of merged.brands) params.append("brand", brand);
  if (merged.pminCents !== undefined) params.set("pmin", String(merged.pminCents / 100));
  if (merged.pmaxCents !== undefined) params.set("pmax", String(merged.pmaxCents / 100));
  if (merged.dealsOnly) params.set("deals", "1");
  if (merged.sort !== DEFAULT_SORT) params.set("sort", merged.sort);
  if (merged.page !== 1) params.set("page", String(merged.page));

  const qs = params.toString();
  return qs ? `/s?${qs}` : "/s";
}
