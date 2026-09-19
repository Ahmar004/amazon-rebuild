# Build Progress and Handoff

Read this first in a new session, then `roadmap.md` (including Rule-0.0A), `docs/remaining-work-finish-strategy.md` for the per-slice session plan, `CLAUDE.md`, and the plan for the slice you're about to build. Last updated 2026-09-19 around 15:55 UTC (20:55 PKT). The 24-hour window ends around 21:50 UTC (02:50 PKT on 2026-09-20) - under 6 hours left.

## Where things stand

| Roadmap step | Status |
|---|---|
| Step-00 capture setup, recon | Done. Capture hooks log every prompt and response to `.agent-logs/` (see `CAPTURE-TEST.md`). Recon screenshots are in `docs/recon/`. |
| Step-0 to Step-4 planning | Done: `docs/spec.md`, `docs/tech-stack.md`, `docs/design.md`, all approved by the user. |
| Step-5 foundation | Done. The Next.js 16 app is scaffolded, the Neon database is migrated and seeded (720 products, 3,479 reviews, 12 departments), and it deploys to Vercel. |
| Step-6 slices | In progress. See the table below and `docs/remaining-work-finish-strategy.md` for the session-by-session plan. |
| Step-7 hardening, Step-9 README | Not started. Step-8 is skipped (no paid domain, Rule 0.3). |

**Live site:** https://amazon.ahmar9.vercel.app/ (production deploys from `main` on every push). **Repo:** https://github.com/Ahmar004/amazon-rebuild

| Slice | Plan (`docs/superpowers/plans/`) | Status |
|---|---|---|
| 1 Layout shell (header, sub-nav, side menu, location, footer, mobile) | `2026-09-19-slice-1-layout-shell.md` | Done and live. It got a Sonnet review and one fix round (10 findings fixed). |
| 2 Home page | `2026-09-19-slice-2-home.md` | Done and live (commit `bfd706e`, plus the background fix in `1510314`). |
| 3 Search | `2026-09-19-slice-3-search.md` | **Done and live** (commit `42f8e54`). Tests (68 passed), lint, typecheck and build all clean. Visual check was a DOM/structural check (curl against `next start`), not a screenshot - the Claude in Chrome extension was not connected this session. Confirmed: "N-M of X results" header, department/brand filter sidebar, sort dropdown, star ratings, FREE delivery text, working `/api/suggest` typeahead, a separate `MobileFilters` component for the mobile breakpoint. Worth a real screenshot check next time the extension is available. |
| 4 Product page | `2026-09-19-slice-4-product.md` | **Done and live** (commits `2469339`, `b36a75c`). Tests (84 passed), lint, typecheck and build all clean. Visual check: Claude in Chrome was connected this session - desktop screenshots confirmed gallery, buy box (delivery lines, stock, quantity), sticky product nav, carousels, and the reviews section (histogram, "Amazon Customer" reviews, star filter). Mobile checked at 390px via the same-origin iframe trick - hamburger menu, search, sub-nav, breadcrumb, image carousel with dots, title all correct. Known gaps: the shared `Price` component renders the struck-through list price inline on the same row rather than on its own line under the price (reused Slice 3's component rather than duplicating price logic - flag if this needs to change); zoom lens, image-viewer modal and the sticky nav's scroll-trigger were not interactively exercised (only their markup was confirmed present); stock-0 and >8-review code paths are implemented and unit-tested but unexercised by real seeded data (dataset never produces those cases). |
| 5 Cart (add, quantity, save for later, mini-cart, smart wagon) | `2026-09-19-slice-5-cart.md` | **Done and live** (commit `9c9e201`). Tests (125 passed), lint, typecheck and build all clean. Guest cart via HMAC-signed cookie (`lib/auth/guest.ts`), data layer in `lib/data/cart.ts`, server actions in `actions/cart.ts`. Visual check: implementer exercised the full flow live in Chrome against the real dev DB (add from search row and product page, smart-wagon interstitial, mini-cart rail, quantity stepper, save/move-for-later, subtotal) and it matched the recon screenshots; controller re-ran tests/lint/typecheck/build plus a curl check of the empty-cart state. Bug fixed in passing: `useTypeahead` returned a fresh `[]` every render, causing an infinite re-render loop on any page with an empty search box (home, product, cart) - fixed with a stable empty-array reference. Known gap: no separate mobile component tree for cart/smart-wagon (uses responsive classes like Slice 3's `ResultRow`), not interactively checked at 390px this session. |
| 6 Auth to 12 History, deals and help | `...slice-6-auth.md` to `...slice-12-history-deals-help.md` | Planned, not started. Budgeted in `docs/remaining-work-finish-strategy.md`. |

## How to resume (Slice 6 next)

1. Read `docs/remaining-work-finish-strategy.md` for the time budget and session shape.
2. Dispatch one Sonnet implementer on `docs/superpowers/plans/2026-09-19-slice-6-auth.md`.
3. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`; fix anything failing.
4. Per `CLAUDE.md`, Slice 6 (auth) also gets a separate Sonnet reviewer subagent before the visual check, since it handles passwords.
5. Visual check: `npx next start -p 3100`, then either Claude in Chrome (if connected - check with `tabs_context_mcp` first) or the curl/DOM fallback used for Slice 3 if it is not.
6. Commit (code + `.agent-logs/`) and push to `main` (pre-approved, this deploys).
7. Update this file's status table and the strategy doc's status column, then stop the session (Rule-0.0A: one slice per session).

## How the work is run (decided with the user; keep doing it this way)

- **One slice at a time, in the plan order.** One Sonnet implementer subagent builds a whole slice from its plan file. The controller (Opus) checks it visually against amazon.com and its tests, then commits (including `.agent-logs/`) and pushes to `main`. Pushing to `main` is pre-approved by the user.
- **Reviews:** only Slices 6 (auth), 7 (checkout) and 8 (orders) get a separate Sonnet reviewer subagent, because they handle passwords, payments and refunds. The other slices rely on tests plus the controller's visual check.
- **The user's usage budget is tight.** Keep dispatch prompts short and point at the plan file instead of pasting it. Use few screenshots, at scale 0.5.
- **Never run two agents that commit to `main` at the same time.** Wait for one to finish before dispatching the next.
- **Rulings already made:**
  - `useDismiss`, `Popover` and `Modal` get no unit tests; their Esc and outside-click behaviour is covered by the Step-7 Playwright tests.
  - `Header` and `HeaderMobile` take `deliverTo` and `cartLink` slots. The cart count is `<CartLink count={0}/>` until Slice 5 streams the real count.
  - The desktop and mobile breakpoint is 768px.

## Gotchas already found (do not rediscover them)

- **Database:**
  - `drizzle-kit migrate` hangs on this machine. Use `npm run db:migrate` (our own `scripts/migrate.ts`).
  - The Neon HTTP driver has no transactions, so use `withTransaction()` from `lib/db/client.ts` for checkout and cancel.
  - Generated columns need immutable functions; that's why `immutable_array_to_string` exists (migration 0000).
  - Product ratings are star counts (`rating_counts int[5]`) with generated `rating_count` and `rating_avg`. `lib/reviews/histogram.ts` derives them from the dataset's average.
  - Reviews show the author "Amazon Customer", because the dataset has no reviewer names.
- **Typeahead:** use `word_similarity` (`$1 <% title`), not the whole-title `%` match.
- **Font:** amazon.com renders in Arial, so no web font is loaded.
- **Browser automation (Claude in Chrome):**
  - The window can't be resized, and screenshots sometimes time out; retry once, then inspect the DOM.
  - For a 390px check, replace the page with a same-origin iframe: `document.body.innerHTML = '<iframe src="/" style="width:390px;height:900px">'`.
  - A hidden or background tab can delay Suspense hydration.
  - Results containing URL query strings get blocked, so strip the query strings in JavaScript first.
- **Claude Code on this machine:** after a crash, the background daemon can restart a hidden forked copy of the session. It ran as a second controller once and had to be stopped (with the user's approval). If commits or plan files appear that you didn't make, check the Claude processes (for example `claude.exe` with `--fork-session`).
- **Security:** never paste keys into the chat. Prompts are logged to `.agent-logs/`, which is public. Keys live only in `.env.local` (git-ignored) and in the Vercel project settings.
- **Before Slice 7:** check that `.env.local` has both Stripe test keys. (`DATABASE_URL`, `DATABASE_URL_TEST` and `SESSION_SECRET` were set as of Step-5.)
