# Build Progress and Handoff

Read this first in a new session, then `roadmap.md`, `CLAUDE.md`, and the plan for the slice you're about to build. Last updated 2026-09-19 around 09:45 UTC (14:45 PKT). The 24-hour window ends around 21:50 UTC (02:50 PKT on 2026-09-20).

## Where things stand

| Roadmap step | Status |
|---|---|
| Step-00 capture setup, recon | Done. Capture hooks log every prompt and response to `.agent-logs/` (see `CAPTURE-TEST.md`). Recon screenshots are in `docs/recon/`. |
| Step-0 to Step-4 planning | Done: `docs/spec.md`, `docs/tech-stack.md`, `docs/design.md`, all approved by the user. |
| Step-5 foundation | Done. The Next.js 16 app is scaffolded, the Neon database is migrated and seeded (720 products, 3,479 reviews, 12 departments), and it deploys to Vercel. |
| Step-6 slices | In progress. See the table below. |
| Step-7 hardening, Step-9 README | Not started. Step-8 is skipped (no paid domain, Rule 0.3). |

**Live site:** https://amazon.ahmar9.vercel.app/ (production deploys from `main` on every push). **Repo:** https://github.com/Ahmar004/amazon-rebuild

| Slice | Plan (`docs/superpowers/plans/`) | Status |
|---|---|---|
| 1 Layout shell (header, sub-nav, side menu, location, footer, mobile) | `2026-09-19-slice-1-layout-shell.md` | Done and live. It got a Sonnet review and one fix round (10 findings fixed). |
| 2 Home page | `2026-09-19-slice-2-home.md` | Done and live (commit `bfd706e`, plus the background fix in `1510314`). |
| 3 Search | `2026-09-19-slice-3-search.md` | **Code written, not verified.** It's on branch `wip/slice-3-search` (commit `891c67a`), not on `main`. The implementer reported its tests, lint, typecheck and build clean, then was stopped before its visual check. |
| 4 Product page to 12 History, deals and help | `...slice-4-product.md` to `...slice-12-history-deals-help.md` | Planned, not started. |

## How to resume Slice 3

1. `git merge --ff-only wip/slice-3-search` into `main` (or cherry-pick `891c67a`), then amend the message to `Slice 3: search (typeahead, results, filters, sort, pagination, mobile)`.
2. Run `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`, and fix anything failing.
3. Check visually: run `npx next start -p 3100` after the build, and compare `/s?k=headphones` and the typeahead with amazon.com at desktop width and at 390px (see the browser notes below).
4. Push `main` (this deploys), then delete the branch: `git push origin --delete wip/slice-3-search`.

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
