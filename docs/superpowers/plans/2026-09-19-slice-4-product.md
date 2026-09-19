# Slice 4 - Product Page Implementation Plan (lean process)

> One Sonnet implementer builds the whole slice; the controller checks it visually against amazon.com.

**Goal:** Amazon's product detail page at `/dp/<asin>`, desktop and mobile web: breadcrumb, gallery with zoom and full view, title block, price, "About this item", buy box (delivery, stock, quantity; the cart buttons arrive in Slice 5), carousels, product information, and customer reviews with the star histogram.

**Spec:** `docs/spec.md` 5.5, 6.2, 6.6, 6.7; `docs/design.md` 5.1, 5.3 (`products.ts`, `reviews.ts`), 6.4, 7. Recon: `docs/recon/2-search-result-product-page-scroll-1..6.png`.

## Global Constraints

- Match amazon.com exactly: check a live product page (desktop width) with the Claude in Chrome tools before building. Colours only via tokens in `app/globals.css`; no hex in components; no emojis or long dashes. No "Sponsored" labels or ad units.
- Data only through `lib/data/*`. Product data and reviews are cached: `'use cache'`, `cacheLife("hours")`, `cacheTag("product:<asin>")`, where related products use tag `products`. The buy box (stock, delivery dates from the `deliver_to` cookie via `getDeliveryLocation()` in `lib/location-server.ts`) renders at request time inside `<Suspense>`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`, and the ISR-with-Cache-Components guide under `node_modules/next/dist/docs/01-app/02-guides/`, for `generateStaticParams`.
- Reuse Slice 3's `Price`, `Stars`, `ProductSummary`, `lib/pricing/money.ts`, `delivery.ts`, `shipping.ts`, and `imageAt()` from `lib/assets.ts`; don't duplicate them.
- TDD for new logic (see the failing run first). Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Product page, end to end

**Files:**
- `lib/data/products.ts` (add `getProduct`, `getRelated`, `getTopAsins`)
- `lib/data/reviews.ts` (`getReviewSummary`, `getReviews`)
- `app/(shop)/dp/[asin]/page.tsx`, plus `not-found` handling for an unknown asin (calls `notFound()`)
- `components/product/*`: `Breadcrumb`, `Gallery` (client), `ImageViewer` (client, uses `Modal`), `TitleBlock`, `AboutThisItem`, `BuyBox`, `QuantitySelect`, `Carousel` (client), `ProductTile`, `ProductInformation` (client accordion), `StickyProductNav` (client), `ReviewSummary`, `ReviewList`, `ShareButton` (client)
- Tests `tests/unit/data/reviews.test.ts` and `tests/unit/product/*.test.ts` for the pure helpers

**Contracts:**
- `getProduct(asin): Promise<ProductDetail | null>`, where `ProductDetail = ProductSummary & { categoryPath: string[]; departmentName: string; features: string[]; description: string; details: Record<string, string>; images: { thumb: string; large: string; hiRes: string | null }[]; ratingCounts: number[] }`.
- `getRelated(asin, departmentSlug, limit): Promise<ProductSummary[]>`: same department, excluding this product, ordered by rating count. The two carousels take different slices of it ("Customers also viewed" is items 0-19 sorted by rating count; "Products related to this item" is the next 20, or the same department sorted by price proximity). Keep the choice in one pure function with a test.
- `getTopAsins(n): Promise<string[]>`: the 200 most-rated products, for `generateStaticParams`.
- `getReviewSummary(asin): { average: number; count: number; percents: StarPercents }`, built from the product's `ratingCounts` with `averageRating`, `totalRatings` and `histogramPercents` from `lib/reviews/histogram.ts` (already tested).
- `getReviews(asin, { star?: 1|2|3|4|5; page: number })`: page size 8, newest first, returning `{ items: Review[]; total: number }`.

**Look and behaviour (desktop, from 768px; recon plus the live check):**
- **Breadcrumb:** the category path ("Electronics › Computers & Accessories › ...") in 12px `text-text-muted` links; the first item links to `/s?i=<departmentSlug>` and the rest link to `/s?k=<segment>&i=<departmentSlug>`.
- **Three columns:**
  - **Left, the gallery (about 40%):** a vertical thumbnail strip (40x40, 1px border, orange focus border when hovered or selected) with the main image to its right (`hiRes ?? large`, `object-contain`, max height 500px). Hovering the main image shows a zoom lens; the enlarged view renders as a large panel over the centre column, as on Amazon. "Click to see full view" under the image opens `ImageViewer` (a modal with the large image and a thumbnail row). A share icon at the top right copies the URL and shows a small "Copied" tooltip.
  - **Centre:**
    - Title 24px, line-height 32px. The brand line reads "Visit the <Brand> Store" as a link to `/s?k=<brand>` (for books: "by <Author> (Author)").
    - Rating row: the number, stars, a caret, and "<n> ratings" linking to `#reviews`.
    - A "Best Seller" badge when applicable.
    - A 1px divider, then the price: a red "-23%" when discounted, the large `Price`, then "List Price: $x.xx" struck through, small, on the next line.
    - "About this item" (16px bold) as a bullet list of `features`.
  - **Right, the buy box (about 245px, 1px border, 8px radius, padding 18px):**
    - The price.
    - "FREE delivery **Tuesday, Sep 29**" (standard; items at or over $35 per spec 6.2, otherwise "$6.99 delivery"), then "Or fastest delivery **Saturday, Sep 26**" (fast, +2 days). The "Details" link opens a small popover explaining the rule.
    - A location row: the pin + "Deliver to <city> <zip>" (opens the existing `LocationModal`).
    - Stock: "In Stock" (18px, `text-in-stock`); when 10 or fewer, "Only N left in stock - order soon." in `text-price-deal`; when 0, "Currently unavailable." and no quantity.
    - `QuantitySelect`: Amazon's grey rounded select "Quantity: 1", with options 1 to min(stock, 30).
    - The "Add to cart" and "Buy Now" buttons are omitted in this slice (Slice 5 adds them; no dead buttons). Leave a clearly named slot where they go.
    - A small info table: "Ships from Amazon.com", "Sold by Amazon.com", "Returns 30-day refund/replacement", "Payment Secure transaction".
    - "Add to List" is omitted (Slice 10).
- **Carousels:** "Customers also viewed these products" and "Products related to this item". Horizontal rows of `ProductTile` (image 160px high, a title link clamped to 3 lines, stars + count, price), with circular prev/next arrow buttons and "Page 1 of N" at the top right; paging slides by one visible page. No "Sponsored" label.
- **Product information** (under the carousels): an "Item details" accordion listing `details` key/value pairs in a two-column table, then the description paragraphs, all under "Product information" in the recon style.
- **Sticky product nav:** once the page scrolls past the buy box, a slim white bar pins under the header (the header itself doesn't hide here) with "↑ Top", "About this item", "Similar", "Product information", "Reviews" anchors, and on the right the thumbnail + truncated title. Use an inline arrow SVG, not a unicode arrow.
- **Reviews (`id="reviews"`):**
  - Left column (about 300px): "Customer reviews", large stars + "4.5 out of 5", "1,234 global ratings", and five histogram rows ("5 star", an orange bar in a grey track with a 1px border, "72%"); each row links to `?star=5#reviews`. Then "Review this product" / "Share your thoughts with other customers" and a bordered "Write a customer review" button linking to `/review/create-review/<asin>` (the page comes in Slice 11; it 404s until then).
  - Right column: "Top reviews from the United States" with each review showing a grey person avatar SVG, "Amazon Customer", stars + bold title, "Reviewed in the United States on <Month D, YYYY>", "Verified Purchase" in orange-brown 12px when verified, the body (clamped with "Read more"), and "<n> people found this helpful". A star filter shows "Showing <n> star reviews" with a "Clear filter" link. "See more reviews" pages through them (`?rpage=2#reviews`).
  - The "Helpful" button is omitted (voting comes with sign-in, Slice 11).
- **Mobile (below 768px):** a single column: the brand link, title, rating row, a swipeable image carousel with dot indicators, the price block, the delivery and stock block, the quantity select, "About this item", the carousels as horizontal scroll strips, the product information accordion, and reviews stacked (histogram, then the list). No zoom lens and no sticky nav.
- `generateStaticParams` returns `getTopAsins(200)`; other ASINs render on demand and are then cached.

**Steps:**
- [ ] 1. Check a live amazon.com product page (desktop width) to confirm the layout values; note differences in the report.
- [ ] 2. TDD the pure helpers (the carousel split, review paging and star filter parameters, the review summary) and the data functions against their contract, where testable without the database. See them fail, then implement.
- [ ] 3. Build the page and components, desktop and mobile.
- [ ] 4. Verify in the browser, using several products: with a list price, low stock, books (author line), and many versus few reviews. For 390px use the same-origin iframe trick; screenshots can time out, so retry once, otherwise inspect the DOM. Check the zoom, full view, carousels, accordion, sticky nav, star filter, review paging, the location change updating delivery text, and that an unknown asin gives the not-found page.
- [ ] 5. Run tests, lint, typecheck and build; commit "Slice 4: product page (gallery, buy box, carousels, info, reviews, mobile)".

Write the report to `.superpowers/sdd/2026-09-19-slice-4-product/report.md`: live-site differences, TDD evidence, visual verification, files changed, and concerns.
