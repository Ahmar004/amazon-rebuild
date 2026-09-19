# Amazon Rebuild - Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to build this slice by slice (roadmap Step-6). At the start of each slice, write that slice's step-by-step plan (with code and test steps) to `docs/superpowers/plans/2026-09-19-slice-<n>-<name>.md`, based on the slice's task list in section 9. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship a working, deployed amazon.com clone whose UI matches Amazon's, built as independently deployable vertical slices.

**Architecture:** A single Next.js 16 App Router app with Cache Components.
- **Pages:** shared catalogue UI is cached with `'use cache'` and served as a static shell; per-user parts stream inside `<Suspense>`.
- **Mutations:** Server Actions that check the session first.
- **Data:** all reads and writes go through `lib/data/*` (Drizzle on Neon Postgres).
- **Rules:** money, delivery and order-status rules are pure functions in `lib/pricing/*` with unit tests.

**Tech Stack:** Next.js 16.3, React 19.3, TypeScript strict, Tailwind 4.3, Drizzle 0.45 with `@neondatabase/serverless` 1.1, Zod 4.6, bcryptjs 3.0, Stripe 22.6 with `@stripe/react-stripe-js` 6.10, Vitest 5, Playwright 1.63.

**Spec:** `docs/spec.md` (what) and `docs/tech-stack.md` (with what). This document says how. It must not add requirements; where it chooses a detail the spec leaves open, the choice is marked **(design choice)**.

## Global Constraints

- UI matches amazon.com; the live page is checked before building each screen (CLAUDE.md, Amazon Fidelity).
- No emojis; no long dashes; single hyphen only.
- USD, US addresses, default location New York 10001.
- Money is integer cents, calculated only on the server, in `lib/pricing`.
- The safety notice and site-wide noindex must be present (spec section 2).
- No "Sponsored" labels.
- Links to Amazon features we don't build open the real site in a new tab (`lib/constants/links.ts`).
- Amazon asset URLs live only in `lib/assets.ts`. Product images use Amazon CDN size suffixes; Vercel image optimisation is off.
- Every user-owned resource is ownership-checked on the server.
- Forms use a real `<form onSubmit>`: Enter submits, Esc closes dialogs.
- Every screen has empty, loading and error states.
- Test-first for `lib/pricing`, `lib/auth`, `lib/data` query builders and all Server Actions' authorisation.
- One commit per finished slice, including `.agent-logs/`; deploy before starting the next slice.
- Free of cost only (Rule 0.3).

---

## 1. Screens, pop-ups, tabs and flows

**Screens**

| # | Screen | Route | Layout |
|---|---|---|---|
| 1 | Home | `/` | shop |
| 2 | Search results and department browse | `/s?k=&i=&rating=&brand=&pmin=&pmax=&deals=&sort=&page=` | shop |
| 3 | Product | `/dp/[asin]` | shop |
| 4 | Added to cart | `/cart/smart-wagon?asin=&qty=` | shop |
| 5 | Shopping Cart | `/cart` | shop |
| 6 | Sign in or create account (identifier step) | `/ap/signin?return_to=` | auth |
| 7 | Sign in (password step) | `/ap/signin/password?email=&return_to=` | auth |
| 8 | Create account | `/ap/register?email=&return_to=` | auth |
| 9 | Secure checkout | `/checkout` (cart) or `/checkout?buy=<asin>:<qty>` (Buy Now) | checkout |
| 10 | Order confirmation | `/checkout/thankyou/[orderId]` | checkout |
| 11 | Your Orders (tabs below) | `/your-orders?tab=&period=` | shop |
| 12 | Order details | `/your-orders/[orderId]` | shop |
| 13 | Your Account hub | `/your-account` | shop |
| 14 | Login & security | `/your-account/login-security` | shop |
| 15 | Your Addresses | `/your-account/addresses` | shop |
| 16 | Your Payments | `/your-account/payments` | shop |
| 17 | Your Lists | `/lists` and `/lists/[listId]` | shop |
| 18 | Write or edit a review | `/review/create-review/[asin]` | shop |
| 19 | Browsing history | `/history` | shop |
| 20 | Today's Deals | `/deals?i=&sort=` | shop |
| 21 | Customer Service hub | `/customer-service` | shop |
| 22 | Help article | `/customer-service/[topic]` | shop |
| 23 | Not found | `not-found.tsx` (Amazon's "Sorry! We couldn't find that page" with the dog image) | shop |

**Pop-ups and overlays:**
- Deliver-to first-visit popup.
- Location modal ("Choose your location").
- Language popover.
- Account & Lists flyout.
- "All" side menu (drawer).
- Search department dropdown.
- Typeahead suggestion list and page dim.
- Add to List dropdown with "Create a List" modal.
- Image viewer ("Click to see full view").
- Checkout address modal.
- Add-card form (Stripe Payment Element).
- Checkout "Secure checkout" info dropdown.
- Confirm dialogs for Delete, Remove address, Cancel items, and Delete list.

**Tabs:**
- Your Orders: Orders, Buy Again, Not Yet Shipped, and linked-out Digital Orders and Amazon Pay.
- Product reviews: filter by star.
- Checkout steps 1 to 3.

**Flows:**
- **Browse:** home, then a card tile, then search, then product.
- **Search:** typeahead, then results, then filters and sort, then product.
- **Guest buy:** add to cart, then smart-wagon, then cart, then proceed to checkout, then sign-in or register, then back to checkout, then address, then card, then place order, then confirmation.
- **Buy Now:** product, then checkout with only that product.
- **Orders:** track, cancel before shipping, buy again, then write a review after delivery.
- **Account:** manage login details, addresses and cards.
- **Lists:** add to list, create list, move to cart.
- **History:** product views are recorded, then the strip and the history page.
- **Location:** ZIP code or saved address, then delivery dates update.

## 2. File structure

```
app/
  layout.tsx                  root: <html>, fonts, noindex metadata
  robots.ts                   disallow all
  not-found.tsx
  (shop)/layout.tsx           Header + SubNav + children + HistoryStrip + Footer
  (shop)/page.tsx             home
  (shop)/s/page.tsx
  (shop)/dp/[asin]/page.tsx
  (shop)/cart/page.tsx
  (shop)/cart/smart-wagon/page.tsx
  (shop)/your-orders/page.tsx, [orderId]/page.tsx
  (shop)/your-account/page.tsx, login-security/page.tsx, addresses/page.tsx, payments/page.tsx
  (shop)/lists/page.tsx, [listId]/page.tsx
  (shop)/review/create-review/[asin]/page.tsx
  (shop)/history/page.tsx
  (shop)/deals/page.tsx
  (shop)/customer-service/page.tsx, [topic]/page.tsx
  (auth)/layout.tsx           logo + centred box + minimal footer + SafetyNotice
  (auth)/ap/signin/page.tsx, ap/signin/password/page.tsx, ap/register/page.tsx
  (checkout)/layout.tsx       "Secure checkout" header + minimal footer
  (checkout)/checkout/page.tsx, checkout/thankyou/[orderId]/page.tsx
  api/suggest/route.ts        GET typeahead
  api/cart/count/route.ts     GET header cart count after client-side adds
actions/                      Server Actions, one file per area
  auth.ts cart.ts location.ts checkout.ts orders.ts addresses.ts payments.ts lists.ts reviews.ts history.ts account.ts
lib/
  db/schema.ts db/client.ts
  data/products.ts search.ts cart.ts users.ts orders.ts addresses.ts payments.ts lists.ts reviews.ts history.ts departments.ts
  pricing/money.ts shipping.ts tax.ts totals.ts delivery.ts order-status.ts order-id.ts
  auth/session.ts password.ts current-user.ts guest.ts
  stripe.ts
  location.ts                 ZIP code lookup (api.zippopotam.us) and location cookie
  validation/                 Zod schemas per form
  constants/domain.ts links.ts sort.ts help-topics.ts
  content/home.ts             hero slides and home cards (labels, Amazon image URLs, hrefs)
  assets.ts
components/
  layout/  Header HeaderMobile SubNav SideMenu Footer FooterMinimal SearchBar DeliverTo LocationModal LanguagePopover AccountFlyout CartLink SafetyNotice HistoryStrip
  product/ Price Stars ResultRow ProductTile Carousel Gallery BuyBox QuantitySelect AddToCartButton AddToList ReviewSummary ReviewList
  cart/    CartLine MiniCart SavedForLater
  checkout/ AddressStep PaymentStep ReviewStep OrderSummary AddressModal CardForm
  orders/  OrderCard
  ui/      Button Modal Popover Alert Field Select Spinner Breadcrumb Pagination
hooks/     useDismiss useScrollDirection useTypeahead
scripts/   import-catalogue.ts seed.ts
data/      catalogue.json (generated by import-catalogue, committed)
drizzle/   migrations
tests/unit/**  tests/e2e/**
```

## 3. Design tokens (`app/globals.css`, Tailwind `@theme`)

These are Amazon's values, confirmed against the live site in Slice 1:

| Token | Value | Use |
|---|---|---|
| `--color-nav` | #131921 | top bar |
| `--color-subnav` | #232f3e | sub-nav, footer body |
| `--color-back-to-top` | #37475a | back-to-top band |
| `--color-footer-bottom` | #131a22 | footer sister-brand grid |
| `--color-search-btn` | #febd69 | search button |
| `--color-btn-yellow` / border | #ffd814 / #fcd200 | Add to cart, primary buttons |
| `--color-btn-orange` / border | #ffa41c / #ff8f00 | Buy Now |
| `--color-link` / hover | #007185 / #c7511f | links |
| `--color-text` / muted | #0f1111 / #565959 | body text |
| `--color-price-deal` | #cc0c39 | discount percentage, low stock |
| `--color-in-stock` | #007600 | "In Stock" |
| `--color-star` | #de7921 | rating stars |
| `--color-border` | #d5d9d9 | cards, inputs |
| `--color-page-bg` | #e3e6e6 | home background |
| `--font-sans` | "Amazon Ember", Arial, sans-serif | everything |

Breakpoint **(design choice):** below 768 px renders the mobile components; 768 px and up renders desktop.

## 4. Data model (`lib/db/schema.ts`)

```ts
users            { id uuid pk, email text unique (stored lowercased), name text, passwordHash text,
                   stripeCustomerId text null, createdAt timestamptz }
sessions         { id text pk (32 random bytes, hex), userId uuid fk users on delete cascade, expiresAt timestamptz }
departments      { id serial pk, slug text unique, name text, sortOrder int }
products         { asin text pk, title text, brand text, departmentId int fk, categoryPath text[],
                   priceCents int, listPriceCents int null, ratingTotal numeric(12,1), ratingCount int,
                   stock int, isBestSeller bool, features text[], description text, details jsonb,
                   images jsonb /* {thumb, large, hiRes}[] */, importedRank int /* "Newest Arrivals" order */,
                   searchVector tsvector generated (title A, brand B, features C) + GIN index,
                   trigram GIN index on title and brand }
reviews          { id serial pk, asin fk, userId uuid null fk, authorName text, rating int 1..5, title text,
                   body text, verified bool, helpfulCount int default 0, source 'dataset'|'user', createdAt,
                   unique (asin, userId) where userId is not null }
reviewVotes      { reviewId fk, userId fk, pk (reviewId, userId) }
carts            { id uuid pk, userId uuid unique null, guestToken text unique null, updatedAt }
cartItems        { cartId fk cascade, asin fk, quantity int, savedForLater bool, addedAt, pk (cartId, asin) }
addresses        { id uuid pk, userId fk, fullName, phone, line1, line2 null, city, state char(2), zip text,
                   instructions text null, isDefault bool, createdAt }
paymentMethods   { id uuid pk, userId fk, stripePaymentMethodId text unique, brand, last4, expMonth int,
                   expYear int, nameOnCard text, isDefault bool }
orders           { id text pk /* 113-1234567-1234567 */, userId fk, placedAt, speed 'standard'|'fast',
                   deliveryDate date, address jsonb (snapshot), paymentBrand, paymentLast4,
                   itemsCents, shippingCents, taxCents, totalCents, stripePaymentIntentId text unique,
                   cancelledAt null }
orderItems       { orderId fk cascade, asin fk, title, imageUrl, unitPriceCents, quantity, pk (orderId, asin) }
lists            { id uuid pk, userId fk, name text, isDefault bool, createdAt }
listItems        { listId fk cascade, asin fk, priceAtAddCents int, addedAt, pk (listId, asin) }
browsingHistory  { userId fk, asin fk, viewedAt, pk (userId, asin) }
```

- **Rating (design choice, from spec 6.7):** average = `ratingTotal / ratingCount`. The import sets `ratingTotal = datasetAverage * datasetCount`. A user review adds its rating and adds 1 to the count; an edit applies the difference; a delete takes it away. The star histogram percentages come from the reviews stored in our database (the imported sample plus user reviews). The dataset has no histogram.
- **Guest state:**
  - The cart uses a signed `cart_token` cookie that points at `carts.guestToken`.
  - Browsing history is a `history` cookie (JSON array of up to 20 ASINs).
  - The location is a `deliver_to` cookie holding `{zip, city, state}`.
  - The first-visit popup is dismissed via a `loc_prompt` cookie.

## 5. Server modules and interfaces

### 5.1 `lib/pricing` (pure, unit-tested first)

```ts
money.ts        formatPrice(cents: number): string                        // 2499 -> "$24.99"
                splitPrice(cents: number): { whole: string; fraction: string } // 2499 -> {whole:"24", fraction:"99"}
                discountPercent(priceCents: number, listPriceCents: number | null): number | null // rounded
shipping.ts     FREE_SHIPPING_THRESHOLD_CENTS = 3500; STANDARD_FEE_CENTS = 699; FAST_FEE_CENTS = 999
                shippingCents(itemsCents: number, speed: DeliverySpeed): number
tax.ts          STATE_TAX_RATES: Record<UsState, number>                 // base state rates; AK DE MT NH OR = 0
                taxCents(itemsCents: number, state: UsState): number      // Math.round(items * rate)
totals.ts       computeTotals(input: { lines: { unitPriceCents: number; quantity: number }[];
                  speed: DeliverySpeed; state: UsState }): OrderTotals
                OrderTotals = { itemsCents, shippingCents, beforeTaxCents, taxCents, totalCents }
delivery.ts     deliveryDate(from: Date, speed: DeliverySpeed): Date      // standard +5 days, fast +2 days (UTC)
                formatDeliveryDate(d: Date): string                       // "Tuesday, Sep 29"
order-status.ts orderStatus(o: { placedAt: Date; deliveryDate: Date; cancelledAt: Date | null }, now: Date): OrderStatus
                isCancellable(...same, now): boolean                      // status === 'ordered'
                // ordered < 1h; shipped until delivery date; out_for_delivery on it before 18:00 UTC; delivered after
order-id.ts     newOrderId(): string                                      // /^\d{3}-\d{7}-\d{7}$/
```

Test cases that must exist:
- **Shipping:** $34.99 standard gives 699; $35.00 gives 0; fast is always 999.
- **Tax:** OR gives 0; CA 7.25%, with rounding.
- **Totals:** totals add up across lines.
- **Delivery date:** crossing a month boundary.
- **Order status:** each boundary, at 59 minutes, 1 hour, 17:59 and 18:00 on the delivery date; cancelled always wins.
- **Price formatting:** `formatPrice(5)` gives "$0.05"; `splitPrice(100000)` gives "1,000" and "00".

### 5.2 `lib/auth`

```ts
password.ts     hashPassword(pw): Promise<string>; verifyPassword(pw, hash): Promise<boolean>   // bcrypt cost 10
session.ts      createSession(userId): Promise<void>   // inserts row, sets cookie "session" (httpOnly, secure, lax, 30 days)
                destroySession(): Promise<void>
current-user.ts getCurrentUser(): Promise<SessionUser | null>   // React.cache per request; reads cookie + sessions join users
                requireUser(returnTo: string): Promise<SessionUser> // redirects to /ap/signin?return_to=...
guest.ts        getGuestToken(): Promise<string | null>; ensureGuestToken(): Promise<string>  // HMAC-signed with SESSION_SECRET
SessionUser = { id: string; email: string; name: string; firstName: string }
```

### 5.3 `lib/data` (every function takes the acting user id where ownership applies)

```ts
products.ts     getProduct(asin): Promise<ProductDetail | null>                  // 'use cache', tag product:<asin>
                getRelated(asin, departmentId, limit): Promise<ProductSummary[]>  // 'use cache', tag products
                getProductsByAsins(asins): Promise<ProductSummary[]>
                getDeals(opts: { departmentSlug?: string; sort: DealSort }): Promise<ProductSummary[]>
departments.ts  getDepartments(): Promise<Department[]>                           // 'use cache', tag departments
search.ts       searchProducts(q: SearchQuery): Promise<SearchResult>             // 'use cache', cacheLife minutes
                suggest(prefix: string): Promise<string[]>                        // max 10
                SearchQuery = { k?, dept?, minRating?, brands: string[], pminCents?, pmaxCents?, dealsOnly: boolean,
                                sort: SortKey, page: number }   // page size 16
                SearchResult = { total, items: ProductSummary[], brandFacets: { name; count }[] }
cart.ts         getCart(owner: CartOwner): Promise<CartView>                      // lines + saved + server subtotal
                addItem(owner, asin, qty); setQuantity(owner, asin, qty); removeItem(owner, asin);
                setSaved(owner, asin, saved: boolean); mergeGuestCart(guestToken, userId); cartCount(owner)
                CartOwner = { userId: string } | { guestToken: string }
users.ts        findUserByEmail(email); createUser({name,email,passwordHash}); updateUser(userId, patch)
orders.ts       createOrderFromPayment(tx input, see 6.7); listOrders(userId, { period, tab, q }); getOrder(userId, orderId);
                cancelOrder(userId, orderId); buyAgainProducts(userId)
addresses.ts    listAddresses(userId); upsertAddress(userId, input); deleteAddress(userId, id); setDefaultAddress(userId, id)
payments.ts     listPaymentMethods(userId); addPaymentMethod(userId, pm); removePaymentMethod(userId, id); setDefaultPaymentMethod(userId, id)
lists.ts        getLists(userId); getList(userId, listId); ensureDefaultList(userId); createList; renameList; deleteList;
                addToList(userId, listId | 'default', asin); removeFromList(userId, listId, asin)
reviews.ts      getReviewSummary(asin): { average, count, histogram: Record<1|2|3|4|5, number /*percent*/> }
                getReviews(asin, { star?, page }); getUserReview(userId, asin); upsertReview(userId, asin, input);
                deleteReview(userId, asin); voteHelpful(userId, reviewId)
history.ts      recordView(owner, asin); getHistory(owner, limit); removeFromHistory(owner, asin); clearHistory(owner);
                mergeGuestHistory(asins, userId)
```

Every function that takes `userId` filters by it in SQL. Unit tests cover "user A cannot read or change user B's row" for carts, orders, addresses, payment methods, lists and reviews, running against a test database branch.

## 6. Feature designs

### 6.1 Layout shell (header, sub-nav, side menu, footer)

- **`(shop)/layout.tsx`** renders the static parts of `Header` and `Footer` into the static shell. Three small dynamic parts stream inside `<Suspense>`, each with a fallback of the signed-out text at the same size (no layout shift):
  - `<Greeting/>` (reads the session).
  - `<CartLink/>` (the count).
  - `<DeliverTo/>` (the `deliver_to` cookie).
- **`SearchBar`** is a client component:
  - The department `<select>` is styled to match Amazon's; its options come from `getDepartments()`, passed as a prop from the cached layout.
  - `useTypeahead` debounces 150 ms, calls `GET /api/suggest?q=` and cancels stale requests.
  - A `<form action="/s">` submits `k` and `i`.
  - Focus toggles a page-dim overlay (desktop only). Arrow keys move through suggestions, Enter picks one, Esc closes.
- **`SideMenu`:** a client drawer (focus trap, Esc to close, overlay click to close) listing departments from props, Today's Deals, link-outs from `links.ts`, Your Account, Customer Service, and Sign in or Sign out.
- **`AccountFlyout` and `LanguagePopover`:** `Popover` opens on hover with a 100 ms intent delay, or on click; `useDismiss` handles outside clicks and Esc.
- **`useScrollDirection`:** used only on `/s`; it hides the header on downward scroll after 100 px.
- **`Footer`:** static; the link columns come from `links.ts` (ours or link-outs); includes `SafetyNotice`.
- **`HeaderMobile`:** a separate component for widths below 768 px, per spec 5.13.
- **`app/layout.tsx`:** sets `metadata.robots = { index: false, follow: false }`; `robots.ts` disallows `/`.

### 6.2 Home

- `lib/content/home.ts` exports `heroSlides: { image: string; alt: string; href: string }[]` and `homeCards: { title: string; href: string; tiles: { label: string; image: string; href: string }[] }[]`. Image URLs are Amazon's creatives, captured from the live home page in Slice 2. Tile `href`s point to `/s?k=<label>&i=<dept>`.
- The page is fully cached (`'use cache'`, `cacheLife('days')`). `HeroCarousel` is a client component: 5-second auto-advance that pauses on hover, arrows, and keyboard support.
- The sign-in band renders only when signed out: a small Suspense part reads the session; signed-in users get `HistoryStrip` instead.

### 6.3 Search

- `s/page.tsx` parses `searchParams` into a `SearchQuery` with Zod (bad values fall back to defaults) and renders the sidebar shell and a sort select that updates the URL.
- `<Results>` streams inside Suspense; `searchProducts` is cached per query.
- **SQL:**
  - Base `WHERE`: `searchVector @@ websearch_to_tsquery('english', k)` (or no text filter for department browse).
  - Filters: `departmentId`, `(ratingTotal/ratingCount) >= minRating`, `brand = ANY(brands)`, price range, and `listPriceCents > priceCents` for deals.
  - Sort map in `lib/constants/sort.ts`: featured = `ts_rank` desc then ratingCount desc; price-asc; price-desc; review = average desc, then count desc; newest = importedRank desc; bestsellers = isBestSeller desc, then ratingCount desc.
  - Brand facets: `SELECT brand, count(*) ... GROUP BY brand ORDER BY count desc LIMIT 30` over the same filters (except brand).
- **`suggest`:** `SELECT DISTINCT lower(left(title, 60)) ... WHERE title % $1 OR title ILIKE $1 || '%' ORDER BY similarity desc LIMIT 10`. `/api/suggest` responses are cached with `'use cache'` per prefix.
- **`ResultRow`:** Add to cart calls `addToCart({asin, quantity: 1, redirectTo: 'none'})`, then updates the header count through a small client store and `router.refresh()`.

### 6.4 Product page

- `dp/[asin]/page.tsx`:
  - `generateStaticParams` returns the 200 products with the most ratings; others are generated on first visit and then cached.
  - Cached: gallery, title block, About this item, product information, carousels, and the review summary and list (tag `product:<asin>`).
  - Streams per request inside Suspense: `BuyBox` (stock, delivery dates from the `deliver_to` cookie, quantity limit), the `AddToList` user lists, and `<RecordView asin>` (a client component that calls the `recordView` action once on mount).
- **`BuyBox`:** a real `<form action={addToCart}>` with the quantity select. "Add to cart" redirects to `/cart/smart-wagon?asin=&qty=`. The "Buy Now" button carries `formAction` that goes to `/checkout?buy=<asin>:<qty>`. Out-of-stock products show "Currently unavailable." with no buttons.
- **`Gallery`:** thumbnails switch the main image on hover; zoom on hover uses a background-position lens (desktop); the full view is a `Modal`. The share icon copies the product URL to the clipboard and shows Amazon's "Copied" tooltip.
- **Sticky product sub-nav:** an IntersectionObserver on the buy box.
- **Reviews:** the histogram bars link to `?star=n#reviews`; "See more reviews" pages through them; "Helpful" calls `voteHelpful` (needs sign-in).

### 6.5 Cart

- **Owner:** `getCartOwner()` returns `{userId}` when signed in, otherwise `{guestToken}`. `ensureGuestToken` creates the cookie on the first add.
- **Actions in `actions/cart.ts`:**
  - `addToCart(input: { asin: string; quantity: number; redirectTo: 'smart-wagon' | 'none' })`: validates the ASIN, caps the quantity at stock and at 30, and adds to any existing quantity. The product page's form calls it with `'smart-wagon'`; search rows, the mini-cart and "Buy it again" use `'none'`.
  - `updateQuantity`, `deleteItem`, `saveForLater`, `moveToCart`.
  - Each calls `updateTag('cart')` or `refresh()` so the header count updates.
- **`/cart/smart-wagon`:** the "Added to cart" block, the subtotal, "Proceed to checkout (n items)", "Go to Cart", a related carousel, and the `MiniCart` right rail (steppers call the same actions).
- **`/cart`:** `CartLine` list, a `SavedForLater` section, a subtotal box from `getCart().subtotalCents`, and the empty state.
- **Guest checkout:** "Proceed to checkout" when signed out goes to `/ap/signin?return_to=/checkout`.

### 6.6 Auth

- **`/ap/signin`:** a form with one field.
  - The `identify` action lowercases and trims the input.
  - A phone-shaped value (`/^\+?[\d\s()-]{7,}$/`) returns "We cannot find an account with that mobile number".
  - An invalid email returns "Enter a valid email address or mobile number" **(design choice: Amazon's wording, checked live in Slice 6)**.
  - A known email redirects to `/ap/signin/password`; an unknown one redirects to `/ap/register`, carrying `email` and `return_to`.
- **`signIn`:** "Your password is incorrect" on a bad password.
- **`register`:** Zod requires the name ("Enter your name"), a password of at least 6 characters ("Minimum 6 characters required"), and a match ("Passwords must match"); the email must be unique.
- **On success** (both):
  - `createSession`.
  - `mergeGuestCart(guestToken, userId)` and `mergeGuestHistory`, then clear the guest cookies.
  - `ensureDefaultList`.
  - Redirect to a safe `return_to`: it must start with `/` and not `//`; otherwise `/`.
- **`signOut`:** `destroySession`, then redirect to `/`.
- The auth layout shows the logo, the box, the minimal footer, and `SafetyNotice` under the box.

### 6.7 Checkout and Stripe

- **`/checkout`** calls `requireUser('/checkout')` and loads the source items, either the cart's non-saved lines or `buy=<asin>:<qty>`. It redirects to `/cart` when there are none.
- **Page state (client):** `{addressId, paymentMethodId | 'new', speed}`, defaulting to the default address and card and `standard`.
  - Any change calls the `quoteCheckout` action.
  - The server returns `OrderTotals` plus delivery dates via `computeTotals`, using the address's state.
  - The order summary always renders server numbers.
- **`AddressModal`:** the Zod `addressSchema` (5-digit ZIP, 2-letter state from the `UsState` list, phone of 10 or more digits) and the `upsertAddress` action.
- **Placing an order:**
  1. The `createPaymentIntent({addressId, speed, buy?, paymentMethodId?, saveCard})` action:
     - Recomputes the totals and checks stock.
     - Ensures a Stripe customer.
     - Creates a PaymentIntent with `amount = totalCents`, `currency: 'usd'`, `customer`, `metadata {userId, addressId, speed, buy}`, `payment_method` when a saved card is used, and `setup_future_usage: 'off_session'` when saving.
     - Returns `clientSecret`.
  2. **Client:** a new card goes through `stripe.confirmPayment({elements, redirect: 'if_required'})`; a saved card goes through `stripe.confirmCardPayment(clientSecret, {payment_method})`. A Stripe error is shown inline on `PaymentStep`.
  3. The `finalizeOrder(paymentIntentId)` action:
     - Retrieves the PaymentIntent and requires `status === 'succeeded'`, `metadata.userId === user.id`, and `amount` equal to the freshly recomputed total.
     - Then, in one `db.transaction`, it:
       - inserts the order (idempotent on the unique `stripePaymentIntentId`; a replay returns the existing order);
       - inserts the order items with price snapshots;
       - decrements stock with `stock >= qty` guards;
       - deletes the purchased cart lines (only for a cart checkout).
     - If a stock guard fails, the transaction rolls back and a Stripe refund is issued.
     - Saves the card to `paymentMethods` when requested.
     - Redirects to `/checkout/thankyou/[id]`.
- The checkout layout has the "Secure checkout" dropdown, the cart link, the minimal footer, and `SafetyNotice`.

### 6.8 Orders

- "Search all orders" submits `?q=`, which matches order ids and item titles (`ILIKE`) within the user's orders.
- `listOrders(userId, {period, tab, q})`:
  - Period is `30d`, `3m` or a year.
  - The Not Yet Shipped tab keeps only the `ordered` status, computed with `orderStatus` in code after the SQL date filter.
- **`OrderCard`:** the header row plus the status line ("Arriving Tuesday", "Delivered Sep 22", "Cancelled"). Its actions:
  - "Buy it again" (`addToCart`), "View your item" (`/dp`).
  - "Cancel items", only when `isCancellable`, behind a confirm dialog.
  - "Write a product review", only when delivered.
- **`cancelOrder`:** checks ownership and `isCancellable(now)`, creates a Stripe refund for the PaymentIntent, and in one transaction sets `cancelledAt` and restores stock.
- **Buy Again tab:** `buyAgainProducts(userId)`, the distinct products from delivered, non-cancelled orders.

### 6.9 Account area

- **`/your-account`:** the hub grid. Built cards link to our routes; the rest use `links.ts` link-outs. The link lists below follow the same rule.
- **Login & security:** rows for Name, Email and Password, each with "Edit".
  - `updateName`.
  - `updateEmail`: unique, and needs the current password.
  - `updatePassword`: current password, new password of at least 6 characters, and a match.
- **Addresses:** an "Add address" tile opens the `AddressModal` form on its own page section; cards offer Edit, Remove (confirm) and Set as Default.
- **Payments:**
  - "Add a payment method" calls `createSetupIntent`, then the client Payment Element in `setup` mode with `confirmSetup({redirect:'if_required'})`, then `savePaymentMethod(setupIntentId)`, which retrieves it and stores brand, last 4, expiry and name.
  - Remove detaches the card in Stripe and deletes the row.
  - Set as default.

### 6.10 Lists, reviews, history, deals, help, location

- **Lists:**
  - The `AddToList` dropdown shows the user's lists and "Create a List" (a modal with a name field).
  - Signed out, it redirects to sign-in with `return_to` set to the product.
  - `/lists` shows a sidebar of lists with the selected list's items (image, title, price, date added, "Add to Cart", "Delete"), plus rename and delete for the list.
- **Reviews:**
  - `/review/create-review/[asin]` requires sign-in.
  - It has star buttons (a radio group with keyboard support), a headline, and the written review; it pre-fills the user's existing review and offers Delete.
  - `upsertReview` sets `verified` when the user has a delivered order with that ASIN, adjusts the product's `ratingTotal` and `ratingCount`, and calls `revalidateTag('product:<asin>')`.
- **History:**
  - `recordView` upserts `browsingHistory` for signed-in users, or prepends to the `history` cookie (deduplicated, at most 20).
  - `HistoryStrip` (shop layout, Suspense) shows up to 10 items plus a link to `/history`.
  - `/history` has a grid with Remove per item and "Remove all items".
- **Deals:** `/deals` uses `getDeals`, sorted by discount by default, with a department filter and a "<n>% off" badge.
- **Customer Service:**
  - `lib/constants/help-topics.ts` holds the topic tiles and static articles, which restate spec section 6 (shipping rates, delivery times, cancellation, tax, test payments).
  - `/customer-service` has the tiles and a client-side filter over the article titles; `/customer-service/[topic]` renders an article.
- **Location:**
  - The `setLocation({zip})` action validates 5 digits, looks up the city and state through `api.zippopotam.us/us/<zip>` (free, no key), and sets the `deliver_to` cookie.
  - `setLocationFromAddress(addressId)` checks ownership.
  - A lookup failure shows "Please enter a valid US zip code".
  - `DeliverTo` shows "Deliver to <city> <zip>", or "Hello, <name>" style lines when signed in, per the recon.

## 7. Caching and invalidation

| Data | Cache | Tag | Invalidated by |
|---|---|---|---|
| Departments | `'use cache'`, `cacheLife('days')` | `departments` | import script (redeploy) |
| Product detail, reviews | `'use cache'`, `cacheLife('hours')` | `product:<asin>` | `upsertReview`, `deleteReview`, `voteHelpful` |
| Related, deals, home | `'use cache'`, `cacheLife('hours')` | `products` | redeploy |
| Search results, suggestions | `'use cache'`, `cacheLife('minutes')` | `search` | time |
| Stock in the buy box | not cached | - | - |
| Anything reading cookies or the session | not cached, inside `<Suspense>` | - | - |

## 8. Testing

- **Unit (Vitest):**
  - `lib/pricing/*` (the cases in 5.1).
  - `lib/auth/*`: hash and verify, a safe `return_to`, and guest-token signature tampering.
  - Zod schemas: address, register, review, search params.
  - Data-layer ownership tests (5.3) against a Neon test branch (`DATABASE_URL_TEST`).
  - `searchParams` parsing.
- **E2E (Playwright, Step-7):** at 1280 px and 390 px widths:
  - Search, then product, then add to cart.
  - Guest cart, then register, then checkout with card 4242, then confirmation, then Your Orders, then cancel.
  - Add to List, write a review, the history strip.
  - Location change updates delivery dates.
- **Visual:** each screen is compared against the live amazon.com page (Chrome) before the slice is committed.

## 9. Slice plan

Every slice builds its screens' mobile layout (spec 5.13) together with the desktop layout, never later. Each slice ends with: tests green, lint and build green, a visual check against amazon.com at desktop and mobile widths, a commit (with `.agent-logs/`), a push, and the Vercel deploy verified live. **Slices up to 7 form the core purchase path**; if time runs short, what's live is still a complete store. Header links to pages from later slices stay pointed at their final routes; before those slices land they reach the not-found page, which the no-dead-links rule allows only between slices, never at submission.

**Slice 0 - Foundation (roadmap Step-5)**
- `create-next-app` (TypeScript, App Router, Tailwind 4, ESLint), `cacheComponents: true`, `images.unoptimized`.
- Tokens in `globals.css`; Amazon Ember `@font-face` from `lib/assets.ts`.
- Drizzle schema (section 4) with migrations; `pg_trgm` extension.
- `scripts/import-catalogue.ts` (Hugging Face range reads, then `data/catalogue.json`) and `scripts/seed.ts`.
- `.env.example`; Vitest and Playwright configs.
- Deploy to Vercel with Neon and Stripe env vars; record the commands in CLAUDE.md.
- Tests: the seed row counts and that every product has an image and a price.

**Slice 1 - Layout shell**
- `Header`, `HeaderMobile`, `SubNav`, `SideMenu`, `SearchBar` (the form submits to `/s`; typeahead lands in Slice 3), `AccountFlyout`, `LanguagePopover`, `DeliverTo` with the first-visit popup and `LocationModal` (`setLocation`), `Footer`, `FooterMinimal`, `SafetyNotice`, `not-found`, noindex and `robots.ts`, `links.ts`.
- Tests: `lib/location` ZIP validation; the `links.ts` shape (every entry is either internal or `https://www.amazon.com/...` with `external: true`).

**Slice 2 - Home**
- `lib/content/home.ts` with captured Amazon creatives, `HeroCarousel`, the card grid, the sign-in band, and the mobile home layout (spec 5.13).

**Slice 3 - Search**
- `lib/data/search.ts`, `/api/suggest`, `useTypeahead`, the dim overlay, `/s` with sidebar filters, sort, pagination, `ResultRow` (Add to cart arrives with Slice 5; until then the button renders only once the action exists), the empty state, and the header-hide scroll.
- Tests: the search param schema; the SQL builder produces the expected filters and sort for each `SortKey`.

**Slice 4 - Product page**
- `getProduct`, `getRelated`, `Gallery`, the title block, `Price`, `Stars`, `BuyBox` (stock and delivery), carousels, product information, `ReviewSummary`, `ReviewList`, the sticky sub-nav, and the mobile layout.
- Tests: `lib/pricing/delivery`, `money`; the review histogram maths.

**Slice 5 - Cart**
- `lib/data/cart.ts`, `actions/cart.ts`, the guest token, `/cart/smart-wagon`, `MiniCart`, `/cart`, save for later, share, the header count, and the search-row Add to cart.
- Tests: quantity caps (stock, 30), adding to an existing line, saved-item exclusion from the subtotal, guest versus user ownership.

**Slice 6 - Auth**
- `lib/auth/*`, the `/ap/signin`, `/ap/signin/password` and `/ap/register` flows, the greeting, sign out, guest cart and history merge, and `return_to`.
- Tests: password hashing; the register schema messages; the safe `return_to`; the merge adds quantities with caps.

**Slice 7 - Checkout (core path complete)**
- `lib/pricing/shipping`, `tax`, `totals`, `order-id`, the Stripe client, the checkout page with its three steps, `AddressModal`, the Payment Element, `quoteCheckout`, `createPaymentIntent`, `finalizeOrder`, Buy Now, and the thank-you page.
- Tests: all totals cases; `finalizeOrder` rejects an amount mismatch, a foreign user, or an unsucceeded PaymentIntent; an idempotent replay.

**Slice 8 - Orders**
- `lib/pricing/order-status`, `/your-orders` with tabs and period filter, order details, cancel with refund, and Buy Again.
- Tests: the status timeline boundaries; cancel is allowed only while `ordered`; ownership.

**Slice 9 - Account**
- The hub, Login & security, Addresses page, Payments page (SetupIntent), and the default location from an address.
- Tests: the address schema; the email change needs the password; ownership on addresses and payment methods.

**Slice 10 - Lists**
- `AddToList`, the Create a List modal, `/lists`, move to cart.
- Tests: default list creation; list ownership; no duplicate items.

**Slice 11 - Reviews**
- `/review/create-review/[asin]`, `upsertReview`, `deleteReview`, the verified flag, Helpful votes, and rating recalculation.
- Tests: rating total and count adjust on add, edit and delete; one review per user; one vote per user.

**Slice 12 - Browsing history**
- `RecordView`, the guest cookie, `HistoryStrip`, `/history`, merge on sign-in.
- Tests: guest cookie deduplication and the 20-item cap; the upsert moves an item to the front.

**Slice 13 - Today's Deals and Customer Service**
- `/deals`, `/customer-service`, help articles.
- Tests: the discount sort order.

**Slice 14 - Nice-to-haves (only if every must-have is live)**
- Spec #17: a demo account with orders in every status. Then #18 and #19 in that order.
