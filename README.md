# Shopeedo - 8x technical assessment

Shopeedo is a working online store: about 12,000 real products, accounts, a cart, Stripe checkout, orders you can track and cancel, reviews from buyers, and customer service. It started as a one-day rebuild of amazon.com for the Software Engineer application at [8x.careers](https://8x.careers). The client then changed the brief: keep the idea and the real backend, but design the interface yourself and show what you would change, cut and improve. This README explains those decisions.

**Live site:** https://shopeedo.vercel.app/ (create an account on the first screen; pay with the Stripe test card `4242 4242 4242 4242`, any future date, any CVC)
**Repo:** https://github.com/Ahmar004/amazon-rebuild

## Design decisions

Amazon is the reference, not the blueprint. For each area: what Amazon does, what Shopeedo does instead, and why.

| Area | Amazon | Shopeedo | Why |
|---|---|---|---|
| Brand and trust | Its own brand. An exact copy got the first domain flagged as phishing. | Its own name, SVG wordmark, icon set and a demo notice. | A store has to be trustworthy before it is anything else. |
| Look | Dense, white, many colours, square boxes. | "Clean modern retail": cream light theme by default, a GitHub-style dark theme with a header toggle, one teal accent, rounded cards, soft shadows. | Fewer colours make prices and actions stand out, and a dark theme is expected today. |
| Layout | Separate desktop and mobile sites; the desktop site doesn't shrink below a fixed width. | One fluid layout that scales from a wide monitor down to a phone, including a narrowed desktop window. | One layout means every feature works everywhere, with half the code. |
| Signing in | Browse anonymously; sign in only at "Proceed to checkout". | Sign in or register first, on one screen with a show-password toggle. | The sign-in step moves away from the moment someone wants to pay, and the free database tier isn't spent on anonymous traffic. |
| Home | Mostly static cards and a carousel with grey arrow panels. | An animated hero where clicking the left or right quarter of the slide changes it, category tiles, "Recently viewed" and "Buy again" rails, then real product rails per category. Add to cart and a wishlist heart on every card. | Showing real products on the first screen gets people shopping sooner. |
| Search | One product per row. | A card grid, an "applied filters" chip bar with "Clear all", and filters in a bottom sheet on phones. Filters stay in the URL. | A grid shows more products per screen, and the chips make active filters visible and quick to undo. |
| Product page | A long single column with a separate buy box and a sticky mini-nav. | The gallery beside one sticky purchase panel (price, delivery, quantity, Add to cart, Buy now, wishlist), with details grouped into Overview / Specs / Reviews tabs. | The buy decision stays on screen while the shopper reads. |
| Adding to cart | A full-page "Added to cart" interstitial. | A slide-in cart drawer (product page) or a toast with "View cart" (cards), with a "You're $X away from free shipping" bar worked out on the server. | The shopper stays where they are, and the free-shipping nudge is honest because the server calculates it. |
| Lists | Several named lists behind an "Add to List" menu. | One wishlist with a heart on every product. | One tap instead of three covers what most people use lists for. |
| Checkout | Steps that expand one at a time. | One page: address, delivery speed and payment side by side with a live order summary and a "Place order - $X" button that says what's still missing. Cards only. | The shopper sees everything they are agreeing to at once, and the total they will pay is on the button. |
| Orders | A list with status text; cancel is a separate flow. | An order page with an Ordered > Shipped > Out for delivery > Delivered timeline and a one-click cancel (with refund) until it ships. | People open an order to find out where it is, so that answer comes first. |
| Account | A hub of a dozen tiles, half of them other businesses. | One page with four tabs: Profile & security, Addresses, Payment methods, Orders. | Everything a shopper manages, in one place. |
| Reviews | Anyone can review; "Verified Purchase" is a badge. | Only buyers can review: the server checks for a real order, allows one review per product, and updates the rating. | Every review is from someone who bought the product. |
| Customer service | A help hub linking out to many pages. | One page: shortcuts for your latest orders (track, get help, cancel), searchable help whose answers quote the store's real rules, and a contact form whose requests you can follow. | Most help requests are about a recent order, so that comes first. |

**What was cut, and why:** the language and country pickers (the store is English and USD only), the header "Deliver to" popup (the ZIP is chosen on the product page and at checkout, where it matters), links to other businesses (Prime Video, Registry and so on), multiple lists, sellers and multiple offers, sponsored ads, returns processing (a return is requested through Customer Service), and review photos. Each one either doesn't apply to a single store or adds steps without helping someone buy.

## What is built

- **Catalogue:** 12,000 products in 24 categories with 36,267 reviews from the public Amazon Reviews 2023 dataset, with the marketplace's name scrubbed from all text. Full-text search with typeahead, filters (rating, brand, price, category, deals), six sort orders and paging.
- **Shopping:** home rails, product page, wishlist, cart drawer and cart page with saved-for-later, browsing history, Today's Deals.
- **Buying:** one-page Stripe checkout and Buy now. The server re-reads the PaymentIntent before creating an order, and the order, the stock decrement and the cart cleanup happen in one transaction. Cancelling refunds through Stripe first, then restocks in one transaction.
- **After buying:** order list with status tabs and search, order details with the timeline, buyer-only reviews, account settings, customer service with saved contact requests.
- **Every screen:** light and dark themes, skeleton loading, empty and error states, toasts, optimistic cart and wishlist updates with rollback, keyboard support (Enter submits, Esc closes).

## How to run it

```
npm install
npm run dev            # http://localhost:3000, needs .env.local (see .env.example)
npm run build          # production build, needs DATABASE_URL
npm test               # Vitest unit tests
npm run lint           # ESLint
npm run typecheck      # route types + tsc --noEmit
npm run db:migrate     # apply migrations to DATABASE_URL
npm run db:seed        # load data/catalogue.json.gz into an empty database
```

## Tech stack

Next.js 16 (App Router, TypeScript strict, `cacheComponents`) on Vercel Hobby, Neon Postgres with Drizzle ORM, Tailwind 4, own email-and-password sessions, Stripe in test mode, Vitest and Playwright. Everything runs on free tiers.

Catalogue pages are cached with `'use cache'` and tags, so they load instantly; anything personal (session, cart, wishlist, orders) streams in behind skeletons. All money is integer cents calculated on the server, and every read or write of a shopper's data checks ownership against the session on the server.

## Trade-offs

- **Delivery status is simulated from the order's age** (Ordered for an hour, then Shipped, then Out for delivery and Delivered on the delivery date), so the whole lifecycle is visible without a fulfilment system or background jobs.
- **Product photos load from the dataset's image URLs.** Re-hosting 12,000 products' images is not free at this scale.
- **Cards are added at checkout only**, where Stripe already collects them; the account page manages saved cards.
- **Contact requests are stored and tracked**, but no support team answers them, so the page never promises a reply.

## How AI was used

The whole codebase was built with Claude Code (Anthropic), working from specs written and approved before any code (`docs/spec.md`, `docs/tech-stack.md`, `docs/design.md`) and a `roadmap.md` that enforced one step at a time. When the brief changed, the new requirements and every proposed design change were written into `frontend-rebuild.md` and approved point by point before the rebuild started. Every prompt and response is logged in `.agent-logs/` as it happened (see `CAPTURE-TEST.md`).

Money, auth and data rules were written test-first (255 unit tests). Each slice was checked in a real browser with Playwright screenshots in both themes at desktop and phone widths, and the money paths were run for real: a Stripe test payment end to end, then cancelling that order with a real refund.

## Five-minute walkthrough

1. **Why it changed (30s):** the exact clone got flagged; the brief became "your own design". Show the sign-in screen and the theme toggle.
2. **Browse (1 min):** home hero click zones and rails, search grid with filter chips, product page tabs and sticky purchase panel, a wishlist heart.
3. **Buy (1.5 min):** add to cart and show the drawer with the free-shipping bar, then the one-page checkout with the test card, and the confirmation.
4. **After buying (1 min):** the order timeline and cancel with refund, the account tabs, Customer Service (search help, send a request, see its status).
5. **Engineering (1 min):** server-side money and ownership checks, the PaymentIntent re-read before creating an order, one transaction for order, stock and cart, the tests, and the cut list above.
