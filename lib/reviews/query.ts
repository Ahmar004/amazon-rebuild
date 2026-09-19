// Pure query-string helpers for the product page's review filter/paging links
// (?star=5#reviews, ?rpage=2#reviews), mirroring lib/validation/search.ts's toSearchUrl. Kept
// free of Next.js APIs so tests/unit/product/reviews-query.test.ts can run without a request.

export type ReviewsQuery = {
  star?: 1 | 2 | 3 | 4 | 5;
  page: number;
};

export type RawReviewsParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const VALID_STARS = new Set([1, 2, 3, 4, 5]);

export function parseReviewsParams(raw: RawReviewsParams): ReviewsQuery {
  const starRaw = Number(first(raw.star));
  const star = VALID_STARS.has(starRaw) ? (starRaw as 1 | 2 | 3 | 4 | 5) : undefined;

  const pageRaw = Number(first(raw.rpage));
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  return { star, page };
}

// Builds the review section's URL for a filter/paging link: the current query plus a patch.
// Changing the star filter resets the page to 1, unless the patch itself changes the page
// (the "See more reviews" link).
export function reviewsUrl(current: ReviewsQuery, patch: Partial<ReviewsQuery>): string {
  const merged: ReviewsQuery = { ...current, ...patch };
  if (!("page" in patch)) merged.page = 1;

  const params = new URLSearchParams();
  if (merged.star) params.set("star", String(merged.star));
  if (merged.page !== 1) params.set("rpage", String(merged.page));

  const qs = params.toString();
  return qs ? `?${qs}#reviews` : "#reviews";
}
