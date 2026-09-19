# Slice 3 - Search Implementation Plan (lean process)

> One Sonnet implementer builds the whole slice; the controller checks it visually against amazon.com.

**Goal:** Amazon's search on desktop and mobile web: typeahead suggestions with the page dim, the `/s` results page with filters, sort, pagination and empty state, department browse (`/s?i=<slug>`), and the header that hides on scroll-down on `/s`.

**Spec:** `docs/spec.md` 5.1 (search bar), 5.4, 6.1, 6.2; `docs/design.md` 5.1 (money, delivery), 5.3 (search.ts), 6.3, 7. Recon: `docs/recon/2-search-bar-*.png` (all of them).

## Global Constraints

- Match amazon.com exactly (check the live results page for "headphones" with the Claude in Chrome tools before building). Colours only via tokens in `app/globals.css`; no hex in components; no emojis or long dashes.
- Database access only through `lib/data/*`. `searchProducts` and `suggest` use `'use cache'` with `cacheLife("minutes")` and `cacheTag("search")`. Anything reading cookies (the delivery location) renders inside `<Suspense>` and never inside `'use cache'`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` first; with `cacheComponents`, the current time (for delivery dates) needs `await connection()` or must live in a request-time component (see "Random values and timestamps" in that guide).
- Money in integer cents; formatting and delivery rules live in `lib/pricing/*` with unit tests written first (TDD, see the failing run before implementing).
- Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Search, end to end

**Files:**
- `lib/pricing/money.ts`, `lib/pricing/delivery.ts`, `lib/pricing/shipping.ts`
- `lib/constants/sort.ts`
- `lib/validation/search.ts`
- `lib/data/products.ts` (the `ProductSummary` type and its row mapper)
- `lib/data/search.ts`
- `app/api/suggest/route.ts`
- `hooks/useTypeahead.ts`, `hooks/useScrollDirection.ts`
- `app/(shop)/s/page.tsx`
- `components/search/*`: `ResultsHeader`, `SortSelect`, `FilterSidebar`, `ResultRow`, `Pagination`, `EmptyResults`, `MobileFilters`
- `components/product/Price.tsx`, `components/product/Stars.tsx`
- Modify `components/layout/SearchBar.tsx`: typeahead, dim overlay, keeping the current query and department in the field on `/s`.
- Tests in `tests/unit/pricing/*.test.ts`, `tests/unit/validation/search.test.ts`, `tests/unit/data/search-query.test.ts`

**Contracts (later slices depend on these names):**
- `ProductSummary = { asin: string; title: string; brand: string; departmentSlug: string; imageUrl: string; priceCents: number; listPriceCents: number | null; ratingAvg: number; ratingCount: number; stock: number; isBestSeller: boolean }`. `imageUrl` is the first image's `large` URL.
- `money.ts`:
  - `formatPrice(cents): string`: 2499 gives "$24.99"; 100000 gives "$1,000.00".
  - `splitPrice(cents): { whole: string; fraction: string }`: 2499 gives "24" / "99"; 100000 gives "1,000" / "00".
  - `discountPercent(priceCents, listPriceCents | null): number | null`: rounded; null when there is no list price or it's not higher.
- `shipping.ts`: `FREE_SHIPPING_THRESHOLD_CENTS = 3500`, `STANDARD_FEE_CENTS = 699`, `FAST_FEE_CENTS = 999`, `type DeliverySpeed = "standard" | "fast"`, and `shippingCents(itemsCents, speed)`:
  - Standard below 3500 costs 699; standard at 3500 or more is 0.
  - Fast is always 999.
  - Tests: 3499 gives 699, 3500 gives 0, fast gives 999.
- `delivery.ts`:
  - `deliveryDate(from: Date, speed): Date`: standard adds 5 days, fast adds 2, in UTC. Test the month boundary: Sep 29 plus 5 days is Oct 4.
  - `formatDeliveryDate(d): string` gives "Tuesday, Sep 29". Use a fixed `en-US` format with `timeZone: "UTC"`.
- `sort.ts`: `SORT_OPTIONS = [{ key: "featured", label: "Featured" }, { key: "price-asc", label: "Price: Low to High" }, { key: "price-desc", label: "Price: High to Low" }, { key: "review", label: "Avg. Customer Review" }, { key: "newest", label: "Newest Arrivals" }, { key: "bestsellers", label: "Best Sellers" }]` and `type SortKey`.
- `validation/search.ts`: `parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchQuery` with Zod.
  - The URL params are `k`, `i` (department slug), `rating` (1 to 4), `brand` (repeatable), `pmin` and `pmax` (whole dollars), `deals` ("1"), `sort` (a `SortKey`, default featured), and `page` (1 or more, default 1).
  - Invalid values fall back to the defaults and never throw.
  - `SearchQuery = { k?: string; dept?: string; minRating?: number; brands: string[]; pminCents?: number; pmaxCents?: number; dealsOnly: boolean; sort: SortKey; page: number }`.
  - Also `toSearchUrl(query: SearchQuery, patch: Partial<SearchQuery>): string`, which rebuilds the URL for filter links. Changing any filter resets `page` to 1.
- `lib/data/search.ts`:
  - `searchProducts(q: SearchQuery): Promise<{ total: number; items: ProductSummary[]; brandFacets: { name: string; count: number }[]; department: { slug: string; name: string } | null }>`. The page size is 16.
  - `suggest(prefix: string): Promise<string[]>`: at most 10 results, and none for a prefix shorter than 2 characters.
  - Follow design 6.3's SQL. Keep the WHERE/ORDER builder a pure exported function (`buildSearchSql` or similar) so `tests/unit/data/search-query.test.ts` can check it without a database: each sort key's ORDER BY, each filter's condition, and that brand facets ignore the brand filter.
- `GET /api/suggest?q=` returns `{ suggestions: string[] }`.

**Behaviour and look (desktop, from 768px; recon `2-search-bar-results-scroll-1..5.png`):**
- **Results header bar:** full-width white with a bottom shadow line. On the left, "1-16 of 132 results for" followed by the query in orange bold (`"headphones"`, colour `#c45500` as token `--color-results-query`); for department browse without `k` it reads "1-16 of 60 results in Electronics". On the right, a "Sort by:" dropdown styled as Amazon's grey rounded pill (`Sort by: Featured` with a caret), a real `<select>` that navigates on change.
- **Left sidebar (about 240px):**
  - "Customer Reviews": a link row per threshold (4, 3, 2, 1) showing stars + "& Up"; the selected one is bold. Stars come from `Stars` (orange `--color-star`, an SVG star with half-star support).
  - "Brands": checkboxes that link (each checkbox is a link toggling that brand); the top 8 show, then a "See more" / "See less" toggle.
  - "Price": ranges "Up to $25", "$25 to $50", "$50 to $100", "$100 to $200", "$200 & above", plus Min and Max inputs with a "Go" button (a GET form).
  - "Department": a list of departments (only when no department is selected), each with a count if cheap to compute, otherwise without.
  - "Deals & Discounts": "All Discounts" (deals=1).
  - A "Clear" link appears by any active filter group.
  - Titles are 14px bold; links 14px `text-text` with `text-link-hover` on hover.
- **Result row** (list layout like the recon):
  - Image column about 240px, `bg-tile-bg`, image `object-contain`. Use the `._AC_UL320_` size variant by replacing the suffix in the image URL (keep a helper `imageAt(url, size)` in `lib/assets.ts`).
  - Title: brand on its own line bold (if Amazon shows it for that department), then the title 18px (`text-text`, line-clamp 2, hover `text-link-hover`) linking to `/dp/<asin>`.
  - Rating line: the rating number, stars, a small caret, then the count as a link.
  - Price via `Price`: superscript "$", large whole number, superscript cents, then "List: $x.xx" or "Typical:" struck through in `text-text-muted` when `listPriceCents` exists, plus a "-23%" badge style like Amazon's deals.
  - Delivery line: "FREE delivery **Tue, Sep 29**" when the price is at least $35, otherwise "$6.99 delivery **Tue, Sep 29**". The date is `deliveryDate(now, "standard")`, rendered request-time.
  - When stock is 10 or fewer: "Only N left in stock - order soon." in `text-price-deal`.
  - **No "Add to cart" button in this slice** (it arrives with the cart in Slice 5; a dead button is not allowed).
  - "Best Seller" badge (orange-red label `#e47911` token `--color-best-seller` with white text) above the title when `isBestSeller`.
- **Pagination:** Amazon's pill group: "< Previous", page numbers with an ellipsis, "Next >"; the current page is outlined; disabled ends are greyed.
- **Empty state:** "No results for <query>." plus "Try checking your spelling or use more general terms", and the sidebar still shows.
- **Loading:** a Suspense fallback that keeps the layout (grey skeleton rows).
- **Header on `/s`:** hides on scroll down (after 100px) and shows on scroll up (the recon file name describes this), via `useScrollDirection`; it applies only on `/s`.
- **Typeahead** in `SearchBar`: 150ms debounce, `fetch('/api/suggest?q=')` with an AbortController, up to 10 rows under the input (white, magnifier icon at left, the typed part normal and the rest bold, as in `2-search-bar-home-page-drop-down-suggestions-when-anything-typed-in-search-bar.png`). ArrowUp/ArrowDown move through them, Enter submits the highlighted one, Esc closes, and clicking a row submits it. Focus shows the page dim (black at 50% over the page below the header, desktop only), matching `2-search-bar-home-page-clicking-it-greys-out-the-part-below-top-bar-slightly-on-desktop-only.png`.

**Mobile (below 768px):**
- The results header shows the count, with a "Filters" button that opens `MobileFilters` (a full-screen sheet with the same filter groups, a "Show N results" apply button, and Esc/close).
- Rows are 2 columns: the image about 40% of the width on the left, and the brand, title (3 lines), rating, price, delivery and stock on the right.
- Sort sits inside the Filters sheet.

**Steps:**
- [ ] 1. Check the live amazon.com results page (desktop width) for "headphones" to confirm the values above; adjust only where the live site clearly differs, and list those differences in the report.
- [ ] 2. TDD: write tests for money, shipping, delivery, the search param parsing and `toSearchUrl`, and the SQL builder. See them fail, then implement.
- [ ] 3. Implement the data layer and the API route; check against the seeded database with a quick script: "headphones" gives results, `i=electronics` gives 60, and a brand filter narrows the results.
- [ ] 4. Build the page, components, typeahead, dim and scroll-hide, desktop and mobile.
- [ ] 5. Verify in the browser. The window stays about 958px; for 390px use a same-origin iframe (`document.body.innerHTML = '<iframe src="/s?k=headphones" style="width:390px;height:900px">'`). Screenshots can time out; retry once, otherwise inspect the DOM. Check: suggestions for "head", keyboard navigation, the dim, each filter, sort, pagination, the empty state for "zzzz", department browse from the side menu, header hide/show.
- [ ] 6. Run tests, lint, typecheck and build; commit "Slice 3: search (typeahead, results, filters, sort, pagination, mobile)".

Write the report to `.superpowers/sdd/2026-09-19-slice-3-search/report.md`: live-site differences found, TDD RED/GREEN evidence, the database check output, visual verification, files changed, and concerns.
