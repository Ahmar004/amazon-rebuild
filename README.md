# Amazon.com clone - 8x technical assessment

A one-day clone of amazon.com's desktop and mobile web experience, built for the Software
Engineer application at [8x.careers](https://8x.careers). Not affiliated with Amazon; see the
safety notice in the footer, sign-in/create-account/checkout boxes, and the first-load popup.

**Live site:** https://amazon.ahmar9.vercel.app/
**Repo:** https://github.com/Ahmar004/amazon-rebuild

## What is built

- Global header, sub-nav, "All" side menu, footer - desktop and mobile web as separate designs.
- Home page: hero carousel, category card grid, sign-in band.
- Search: typeahead suggestions, department/brand filters, sort, pagination, star ratings.
- Product page: image gallery, buy box (price, delivery estimate, stock, quantity), carousels,
  reviews with a rating histogram.
- Cart: guest and signed-in carts, add-to-cart page, mini-cart, save/move for later, smart wagon.
- Auth: sign in, create account, sign out, sessions, guest-cart merge on sign-in.
- Secure checkout: Stripe test-mode payments, Buy Now, order confirmation. The server always
  re-reads the PaymentIntent from Stripe before creating an order, and the order insert, stock
  decrement and cart cleanup happen in one database transaction.
- Your Orders: order list with search, matching amazon.com's page layout and site chrome.

**Not built** (see Trade-offs below): Your Account hub / Login & security / Addresses / Payments,
Lists, Write a review, Browsing history, Deliver-to location popup, Today's Deals, Customer
Service, language popover. Links to these exist in the header/account menu and currently 404.

## How to run it

```
npm install
npm run dev          # http://localhost:3000, needs .env.local (see .env.example)
npm run build         # production build, needs DATABASE_URL
npm test               # Vitest unit tests
npm run e2e            # Playwright, desktop and mobile
npm run lint            # ESLint
npm run typecheck        # route types + tsc --noEmit
```

Database: Neon Postgres via Drizzle. `npm run db:migrate` applies migrations, `npm run db:seed`
loads `data/catalogue.json.gz` (12,000 products across 24 departments, 36,267 reviews) into an empty database.

## Tech stack

Next.js 16 (App Router, TypeScript strict, Partial Prerendering) on Vercel Hobby, Neon Postgres
with Drizzle ORM, Tailwind 4, own email-and-password sessions, Stripe in test mode, Vitest and
Playwright. Everything stays free of cost - no paid plans, no billing details anywhere.

## Trade-offs made

This was a 24-hour build, tracked hour by hour in `docs/progress.md` and budgeted by AI usage
percentage in `docs/remaining-work-finish-strategy.md`. Under deadline pressure, the following
were cut, in order, once the usage budget for the remaining slices ran short:

- Your Account, Lists, Write a review, Browsing history, Deliver-to popup, Today's Deals,
  Customer Service, and the language popover were never started. These are the demo-data items
  (item 17-19 in `docs/spec.md`) plus the lowest-ranked remaining M-scope screens.
- Your Orders shipped as a read-only list only - no cancel action, no Buy Again / Not Yet Shipped
  / Digital Orders / Amazon Pay tabs, no time-period filter.
- The live Stripe payment flow (test card, saved-card repeat, declined card) was verified through
  code review of the PaymentIntent re-read and transaction logic, not a full live browser run,
  due to time constraints in that session.
- Step-7 hardening was narrowed to the checkout and orders (money-handling) paths only.

Full detail and the exact reasoning for each cut is in `docs/progress.md` and
`docs/remaining-work-finish-strategy.md`.

## How AI was used

The entire codebase was built with Claude Code (Anthropic), working from a locked-down spec
(`docs/spec.md`, `docs/tech-stack.md`, `docs/design.md`, all written and approved before any code)
and a `roadmap.md` that enforced one step at a time. Every prompt and response was logged to
`.agent-logs/` as it happened (see `CAPTURE-TEST.md`) - nothing there was written after the fact.

Planning steps ran on Claude Opus. Once building started, most feature slices (search, product
page, cart, auth, checkout) were built by a Claude Sonnet implementer subagent working from a
written plan file, with the controlling session reviewing the diff, running tests/lint/typecheck/
build, and doing a live visual check in Chrome before each commit. The rigor level (a separate
reviewer subagent, full re-verification, or trusting the implementer's own report) was scaled down
slice by slice to fit the AI usage budget for a one-day build - see the "Tier A / A-minus / B"
rules in `docs/remaining-work-finish-strategy.md`.

## Five-minute walkthrough outline

1. **Home, search, product page** - hero carousel and category grid, then search with typeahead,
   department/brand filters, sort, star ratings; open a product for the gallery, buy box, and the
   reviews' rating histogram.
2. **Cart** - add to cart from a search result and from the product page, mini-cart rail, quantity
   stepper, save for later.
3. **Sign in / create account** - sign out, then sign in or register; point out that items added
   as a guest are still in the cart after signing in.
4. **Checkout with Stripe** - address, delivery speed, payment with the test card
   `4242 4242 4242 4242`, land on the order confirmation page.
5. **Your Orders** - open it from the header or the confirmation page, show the order in the list,
   and close with the trade-offs made under the deadline (see above).
