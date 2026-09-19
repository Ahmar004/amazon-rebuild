# Tech Stack

Approved by the user on 2026-09-19. Versions were checked on npm the same day. Every part is free of cost (roadmap Rule 0.3).

## 1. The stack

| Layer | Choice | Version | Free tier we rely on |
|---|---|---|---|
| Language and runtime | TypeScript (strict) on Node.js | Node 24 | - |
| Framework | Next.js App Router, one app for pages and API | next 16.3, react 19.3 | - |
| Hosting | Vercel Hobby, auto-deploying from GitHub `main` | - | 1M function calls, 4 active CPU-hours, 100 GB transfer per month; personal, non-commercial use only (which this project is) |
| Database | Neon serverless Postgres, region `aws-us-east-1` | @neondatabase/serverless 1.1 | 0.5 GB storage, 100 CU-hours per month, no credit card; sleeps after 5 minutes idle |
| ORM and migrations | Drizzle ORM and drizzle-kit | drizzle-orm 0.45 | - |
| Validation | Zod, shared by forms and API routes | zod 4.6 | - |
| Styling | Tailwind CSS with Amazon's design tokens in one theme file | tailwindcss 4.3 | - |
| Payments | Stripe in test mode (Payment Element, PaymentIntents, SetupIntents, Refunds) | stripe 22.6, @stripe/react-stripe-js 6.10 | Test mode is free and needs no business details |
| Auth | Our own email and password sessions | bcryptjs 3.0 | - |
| Search | Postgres full-text search plus the `pg_trgm` extension | built into Neon | - |
| Unit and API tests | Vitest | vitest 5.0 | - |
| End-to-end tests | Playwright | @playwright/test 1.63 | - |
| Live URL | `amazon-rebuild.vercel.app` (or the closest free name Vercel assigns) | - | free |

The user needs three free accounts: Vercel (sign in with GitHub), Neon, and Stripe (test mode). They are created in Step-5.

## 2. Why these choices

- **Next.js on Vercel.** One codebase serves pages and API routes, so a slice (page, API and data) ships in one deploy, which fits the one-day slice plan. It deploys to Vercel with no configuration, and every push to `main` gets a live URL, which Rule-8 needs. Its rendering model (section 3) lets catalogue pages be served from the CDN, which keeps us inside the 4 CPU-hour Hobby budget.
- **Why not a React SPA with a separate API.** The free API hosts (Render, Railway trial) sleep and take up to about 50 seconds to wake. A judge's first click would hang. A single-page app also sends an empty page first, which is slower and worse for the product-page experience.
- **Why Postgres and not MongoDB.** Our data is relational: users own carts, orders, addresses, lists and reviews; orders contain order items that point to products; and checkout must change stock, orders and cart together or not at all. Postgres gives us foreign keys, transactions and constraints (for example "one review per user per product") for free. MongoDB would push those guarantees into application code. Postgres also gives us full-text and fuzzy search (section 5) without adding a search service, while MongoDB Atlas's search features are limited on its free tier.
- **Why Neon and not Supabase.** Supabase's free projects pause after a week without activity, and the live link must stay open for judges on an unknown date. Neon's free tier sleeps after 5 minutes but wakes on the next request in under a second, and it never pauses a project. Supabase's big extras (its auth, storage and realtime) are things we don't need: auth must follow Amazon's exact screens and flow, which is simpler to own than to bend. Neon's serverless driver talks to Postgres over HTTP, which suits short-lived Vercel functions that can't hold open connections.
- **Why Drizzle and not Prisma.** Drizzle schemas are plain TypeScript and its queries read like SQL, so the full-text search queries and checkout transactions stay readable. It has no separate engine binary or code generation step, so installs, builds and cold starts are faster on Vercel. Prisma's current major version is still a release candidate (8.0.0-rc), which is a risk we don't need in a one-day build.
- **Why our own auth.** Amazon's flow ("Sign in or create account" with one field, then a password step or a create-account step, and a return path to checkout) is custom. Our own session code is about 150 lines: bcrypt password hashes, a `sessions` table, and a random session id in an http-only, secure, SameSite=Lax cookie. That's smaller and clearer than adapting a library to the flow.
- **Why Tailwind.** Amazon's colours, spacing, font sizes and radii live once in `app/globals.css` as Tailwind theme tokens, so CLAUDE.md's "one theme definition" rule holds and one edit restyles every screen.

## 3. Rendering strategy

We use Next.js 16's default model with `cacheComponents: true`, called Partial Prerendering. It is a mix of static generation, ISR and server rendering chosen per component rather than per page. Each page is a cached static shell served from Vercel's CDN, and only the user-specific parts render per request, streamed inside `<Suspense>`.

| Route | Rendering | Reason |
|---|---|---|
| Home `/` | Static shell and cached content (`'use cache'`, `cacheLife('hours')`). The greeting, cart count and history strip stream per user. | The same for everyone except the header parts, so it loads instantly from the CDN. |
| Product `/dp/[asin]` | Top products are prerendered with `generateStaticParams`; others are generated on first visit and then cached (ISR). Product data is tagged with `cacheTag('product:<asin>')`. Buy-box stock and delivery date stream per request. | Catalogue content rarely changes; stock and the chosen delivery location do. A new review calls `revalidateTag` so the rating updates. |
| Search `/s?k=...` | Static shell (header, filter layout); results stream inside `<Suspense>`. The query function is cached with `'use cache'` keyed by the query and filters. | Results depend on the URL, but the same query from many users reuses one cache entry. |
| Today's Deals, Customer Service, department pages | Static and cached (`cacheLife('hours')`) | Shared content. |
| Cart, checkout, account, orders, lists, history, sign-in | Server-rendered per request (they read the session cookie inside `<Suspense>`), never shared-cached | Private data. The server is the single source of truth for money and ownership. |
| Typeahead, add to cart, quantity stepper, mini-cart, Stripe card field | Client components calling our API routes | Instant interaction without full page loads. |

Writes go through Server Actions or Route Handlers that check the session first, then call `revalidateTag` or `updateTag` for any cached data they change.

## 4. Data layer

- **Tables:**
  - `users`, `sessions`, `addresses`, `payment_methods` (Stripe payment-method id, brand, last 4, expiry, default).
  - `departments`, `products`, `product_images`, `reviews`.
  - `carts`, `cart_items` (guest carts are keyed by a signed cookie id; each item has a `saved_for_later` flag).
  - `orders`, `order_items` (price copied onto the item at purchase time).
  - `lists`, `list_items`, `browsing_history`.
- **Access:** all database access goes through `lib/data/*` functions whose return shapes match the API payloads, as CLAUDE.md requires. Components never query directly.
- **Money:** integer cents in the database, and all calculations live in one server module (`lib/pricing`) covered by unit tests.

## 5. Search

- Each product has a generated `tsvector` column (title, brand, department, features) with a GIN index. `websearch_to_tsquery` handles the user's query, and `ts_rank` provides the "Featured" sort.
- Typeahead suggestions use `pg_trgm` similarity on product titles and brands, so partial words and typos still match. Results are cached per prefix.
- Filters (rating, brand, price, department, deals) are plain `WHERE` clauses on indexed columns.

## 6. Catalogue data

- **Source:** the "Amazon Reviews 2023" dataset (McAuley Lab, UCSD), hosted on Hugging Face at `McAuley-Lab/Amazon-Reviews-2023`. Each department's metadata file has real titles, prices, average rating, rating count, brand (`store`), category path, "About this item" features, description, a details table, and image URLs on `m.media-amazon.com`. The review files have rating, title, text, date and the verified-purchase flag.
- **Access:** checked on 2026-09-19. HTTP range requests on the Hugging Face files work, so the import script streams the first few MB of each department file and never downloads the multi-GB whole. About 27% of records are usable (price, images and a rating count above 20).
- **Import:** a one-off script (`scripts/import-catalogue.ts`) picks about 40 to 80 usable products for each home-page department (Electronics, Computers, Home & Kitchen, Beauty, Clothing Shoes & Jewelry, Toys & Games, Pet Supplies, Video Games, Books, Sports & Outdoors, Baby, Tools & Home Improvement). It maps them to our tables and pulls up to 20 matching reviews per product.
  - **Fields the dataset lacks** are derived by fixed rules and written to the seed, so they're stable: stock (spread between 3 and 60), a list price for about a third of products (current price times 1.1 to 1.4, which creates deals), and "Best Seller" flags.
  - The seed is committed as JSON so any environment rebuilds identically.
- **Licence note:** the dataset is published for research use. This is a non-commercial assessment; the README credits the dataset.
- **Fallback:** if the dataset becomes unreachable, DummyJSON (`dummyjson.com/products`) feeds the same import shape.

## 7. Amazon brand assets and the safety notice

- **Assets (user decision: Amazon's originals):** Amazon's own files are loaded from Amazon's CDN for an exact match: the Amazon Ember font, the logo and icon sprites, and the hero and home-card images. Their URLs are captured from the live amazon.com page during the slice that first needs them, and kept in one `lib/assets.ts` file.
  - Product images use Amazon's size suffixes (for example `._AC_SX300_`, `._AC_SL1500_`), so each surface loads the right size without Vercel image optimisation (which is capped at 5,000 transformations a month on Hobby).
  - A request check on 2026-09-19 confirmed the CDN serves these images to other sites.
- **Safety notice (user decision):** one small line in the footer and under the sign-in, create account and checkout boxes: "Demo clone built for an 8x assessment. Not affiliated with Amazon. Do not enter real Amazon credentials."
  - Every page carries `<meta name="robots" content="noindex, nofollow">` and a `robots.txt` that disallows all crawlers.
  - This keeps phishing detection (Google Safe Browsing, Vercel abuse checks) from taking the live link down during judging.

## 8. Payments with Stripe (test mode)

- Each user gets a Stripe Customer on their first payment action.
- **Checkout:** the server creates a PaymentIntent for the server-calculated order total. The client confirms it with the Payment Element (or a saved card). A webhook-free confirmation step on the server re-reads the PaymentIntent, and only after it has succeeded does it create the order in one transaction (order, items, stock decrement, cart cleanup).
- **Saved cards:** "Your Payments" and "save this card" use SetupIntents; we store only the payment-method id, brand, last 4 and expiry.
- **Cancel:** cancelling an order issues a Stripe Refund and restores stock in one transaction.
- **Keys:** `STRIPE_SECRET_KEY` stays on the server; only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` reaches the browser. Test card: 4242 4242 4242 4242, any future expiry, any CVC.

## 9. Testing and quality

- **Vitest (test-first, per CLAUDE.md):** pricing, shipping and tax rules, order status timeline, cart merge, auth helpers, search query building, and every API route's authorisation checks.
- **Playwright (Step-7):** the key flows on desktop and mobile widths: browse, search, product page, add to cart, sign up, checkout with the test card, orders, cancel.
- **Tooling:** ESLint (Next.js config), TypeScript strict mode, and `npm` scripts for dev, build, lint, test and e2e. These commands are recorded in CLAUDE.md in Step-2.

## 10. Environment variables

| Name | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | server | Neon pooled connection string |
| `SESSION_SECRET` | server | Signs the guest-cart and session cookies |
| `STRIPE_SECRET_KEY` | server | Stripe test secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser | Stripe test publishable key |

They live in `.env.local` (never committed); `.env.example` lists the names with no values.

## 11. Free-tier limits and how we stay inside them

- **Vercel active CPU, 4 hours a month.** This is the tightest limit. Catalogue pages come from the CDN cache, so CPU is only spent on private pages, searches with new queries, and writes. A day of judging stays far below the limit.
- **Neon, 100 CU-hours a month and sleep after 5 minutes.** The database only runs while the site is in use. The first request after sleeping waits well under a second for it to wake, and cached pages don't touch it at all.
- **Neon storage, 0.5 GB.** About 800 products, their image URLs and about 10,000 reviews take roughly 20 to 40 MB.
- **Vercel image optimisation, 5,000 transformations a month.** Not used; images come straight from Amazon's CDN at the right size.

## 12. Effect on the roadmap

With no paid domain, the live link is the free `vercel.app` address. Step-5's "start the custom domain DNS setup" and all of Step-8 no longer apply, and the README (Step-9) records the vercel.app link. The exact roadmap wording change is proposed to the user for approval separately, per Rule-1.
