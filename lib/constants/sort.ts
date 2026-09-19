// Search sort options (docs/design.md 5.3, 6.3). Imported wherever a sort key is shown or parsed
// so the literals never get re-typed (CLAUDE.md: domain enum literals live in a constants module).

export const SORT_OPTIONS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "review", label: "Avg. Customer Review" },
  { key: "newest", label: "Newest Arrivals" },
  { key: "bestsellers", label: "Best Sellers" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export const SORT_KEYS = SORT_OPTIONS.map((o) => o.key) as SortKey[];

export const DEFAULT_SORT: SortKey = "featured";
