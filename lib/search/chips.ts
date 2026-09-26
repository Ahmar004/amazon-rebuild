import { toSearchUrl, type SearchQuery } from "@/lib/validation/search";

// The "applied filters" chip bar on the search page (frontend-rebuild.md C7). Each chip removes
// only its own filter; "Clear all" keeps the keyword and sort. Filters stay in the URL, so every
// chip is a plain link.

export type FilterChip = { key: string; label: string; href: string };

function dollars(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

export function priceRangeLabel(minCents: number | undefined, maxCents: number | undefined): string | null {
  if (minCents === undefined && maxCents === undefined) return null;
  if (minCents === undefined) return `Up to ${dollars(maxCents!)}`;
  if (maxCents === undefined) return `${dollars(minCents)} & above`;
  return `${dollars(minCents)} - ${dollars(maxCents)}`;
}

export function appliedFilterChips(query: SearchQuery, departmentName: string | null): FilterChip[] {
  const chips: FilterChip[] = [];
  if (query.dept) {
    chips.push({ key: "dept", label: departmentName ?? query.dept, href: toSearchUrl(query, { dept: undefined }) });
  }
  if (query.minRating) {
    chips.push({ key: "rating", label: `${query.minRating} stars & up`, href: toSearchUrl(query, { minRating: undefined }) });
  }
  for (const brand of query.brands) {
    chips.push({ key: `brand:${brand}`, label: brand, href: toSearchUrl(query, { brands: query.brands.filter((b) => b !== brand) }) });
  }
  const price = priceRangeLabel(query.pminCents, query.pmaxCents);
  if (price) {
    chips.push({ key: "price", label: price, href: toSearchUrl(query, { pminCents: undefined, pmaxCents: undefined }) });
  }
  if (query.dealsOnly) {
    chips.push({ key: "deals", label: "Deals only", href: toSearchUrl(query, { dealsOnly: false }) });
  }
  return chips;
}

export function clearFiltersUrl(query: SearchQuery): string {
  return toSearchUrl(
    { k: query.k, brands: [], dealsOnly: false, sort: query.sort, page: 1 },
    {},
  );
}
