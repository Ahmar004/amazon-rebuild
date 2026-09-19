# Slice 12 - Browsing History, Today's Deals, Customer Service (lean process; merged slices 12 and 13 by user decision)

> One Sonnet implementer; the controller checks it visually.

**Goal:** Browsing history (recorded views, the strip above the footer, the history page, guest-to-user merge), Today's Deals (`/deals`), and Customer Service (`/customer-service` with its help articles), so every link in the header, footer and side menu resolves.

**Spec:** `docs/spec.md` 5.11, 5.12, 6 (the policy text for the help articles); `docs/design.md` 5.3 (history.ts, getDeals), 6.10. Links that must resolve after this slice: `/deals`, `/customer-service`, `/customer-service/shipping`, `/customer-service/returns`, `/history`.

## Global Constraints

- Match amazon.com: check the live Today's Deals, Customer Service hub and browsing-history pages with the Claude in Chrome tools. Colours only via tokens; no emojis or long dashes.
- **History:** signed-in users go to the `browsingHistory` table (upsert moves an item to the front). Guests use the `history` cookie (a JSON array of at most 20 ASINs, newest first, deduplicated). `mergeGuestHistory(asins, userId)` runs in Slice 6's sign-in and register success path (add the call) and clears the cookie. Anything reading cookies renders inside `<Suspense>`.
- **Deals:** a product is a deal when `listPriceCents > priceCents`. `getDeals` is cached (`'use cache'`, `cacheLife("hours")`, `cacheTag("products")`).
- **Help articles:** static content in `lib/constants/help-topics.ts`, stating our real policies from spec section 6 (shipping rates and speeds, delivery dates, cancellation before shipping, estimated tax, test payments and the demo nature of the store). No invented policies.
- TDD the guest-history cookie helpers (dedup, the 20 cap, newest first, a malformed cookie gives an empty list) and the deal sort. Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: History, deals and help, end to end

**Files:** `lib/history/cookie.ts`, `lib/data/history.ts`, `actions/history.ts` (`recordView`, `removeFromHistory`, `clearHistory`), `components/history/RecordView.tsx` (a client component that calls `recordView` once on mount), `components/history/HistoryStrip.tsx` (server, in Suspense), `app/(shop)/history/page.tsx`; `lib/data/products.ts` (`getDeals`), `app/(shop)/deals/page.tsx`, `components/deals/*`; `lib/constants/help-topics.ts`, `app/(shop)/customer-service/page.tsx`, `app/(shop)/customer-service/[topic]/page.tsx`, `components/help/*`. Modify: the product page (add `RecordView`); `app/(shop)/layout.tsx` (add `HistoryStrip` above the footer); the home page (signed-in users see the strip instead of the sign-in band).

**Look and behaviour:**
- **History strip:** a white band above "Back to top". Signed out with no history, it shows Amazon's text "After viewing product detail pages, look here to find an easy way to navigate back to pages you are interested in." (italic 12px) with a "View or edit your browsing history" link at the right (as in the recon `7-returns-&-Orders...png`). With history, it shows "Your browsing history" plus a horizontal row of up to 10 product thumbnails (links) and the same link.
- **`/history`:** "Your Browsing History" (28px) with "These items were viewed recently. We use them to personalize recommendations." and a "Remove all items from view" link (with a confirmation). A grid of product tiles (image, title, stars, price, Add to cart, and a "Remove from view" link). Empty: "You have no recently viewed items."
- **`/deals`:** "Today's Deals" (28px); a horizontal row of department filter pills ("All" plus departments that have deals; the selected pill is dark); a sort select (Featured, Discount: High to Low default, Price: Low to High, Price: High to Low); a grid of deal cards (image on `bg-tile-bg`, a red "<n>% off" badge + "Limited time deal" label in `text-price-deal`, the price with "List: $x" struck through, title clamped to 2 lines, stars), with an Add to cart on hover or tap. Mobile uses 2 columns.
- **`/customer-service`:** "Hello. What can we help you with?" (28px), then a grid of topic tiles with Amazon's help icons (from the live page, recorded in `lib/assets.ts`): Your Orders (`/your-orders`), Returns and Refunds (`/customer-service/returns`), Manage Addresses (`/your-account/addresses`), Payment Settings (`/your-account/payments`), Account Settings (`/your-account/login-security`), Shipping and Delivery (`/customer-service/shipping`). Then "Search our help library" (an input filtering the article list client-side) and the "All help topics" list linking to `/customer-service/<topic>`. Articles cover `shipping`, `returns` (cancellation before shipping; returns are not supported in this demo), `tax`, `payments` (Stripe test mode) and `about` (demo notice).
- **Mobile:** stacked single columns; pills and the strip scroll horizontally.

**Steps:**
- [ ] 1. TDD the cookie helpers and the deal sort. See them fail, then implement.
- [ ] 2. Implement the data, actions, pages and the merge call.
- [ ] 3. Verify in the browser: view 3 products as a guest (the strip shows them), sign in (they merge), remove one, remove all; deals filter and sort; every header, footer and side-menu internal link now resolves (write a quick script that fetches every internal href in `lib/constants/links.ts` from the dev server and prints any non-200); help search. Use mobile via the 390px iframe trick.
- [ ] 4. Run tests, lint, typecheck and build; commit "Slice 12: browsing history, today's deals, customer service".

Write the report to `.superpowers/sdd/2026-09-19-slice-12-history-deals-help/report.md`.
