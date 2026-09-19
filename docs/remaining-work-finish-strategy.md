# Remaining Work Finish Strategy

Written under Rule-0.0A (`roadmap.md`) at 2026-09-19 ~15:50 UTC (20:50 PKT), deadline 2026-09-19 21:50 UTC (02:50 PKT). This doc is the fixed plan; only the status column changes as slices land. Each new session reads `docs/progress.md` for current status, this doc for the plan, and only the one plan file (`docs/superpowers/plans/...`) for the slice it is about to build - not `spec.md`, `tech-stack.md` or `design.md` again, those are already baked into the plan files.

## Why sessions must stay short

Every extra turn in a long session re-sends the whole conversation, so tokens (and cost) grow with context size, not just with work done. A fresh session per slice keeps each session's context small: read progress.md + this file + one plan file (a few thousand tokens) instead of an ever-growing transcript. This is the same reasoning as roadmap Rule-0.0, applied per slice instead of per day.

## Session shape (repeat per slice) - revised after Slice 5 for token budget

Slice 5 (no reviewer, full controller re-verification) cost about 22% of the session usage budget on its own - re-running tests/lint/typecheck/build/curl after the implementer already ran them was the biggest single cost. At that rate the remaining 9 sessions cannot fit in the 55% of usage left after Slice 5. From Slice 6 onward, the controller does NOT redundantly re-run everything; it trusts the implementer's own report unless that report shows a failure. Two tiers:

**Tier A (Slice 6 Auth only):** full rigor, as built. Dispatch implementer -> dispatch a Sonnet reviewer subagent per `CLAUDE.md` -> controller re-runs `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` itself -> controller does a real visual/flow check (Chrome if connected, otherwise curl/DOM) of the security-critical paths (sign-in/up/out) -> commit and push.

**Tier A-minus (7 Checkout, 8 Your Orders) - revised after Slice 6 for token budget:** Slice 6 cost ~21% of usage against a 9% budget, driven by the separate reviewer dispatch plus a full controller re-run of tests/lint/typecheck/build. Checkout and orders still handle money, so they keep more rigor than Tier B, but drop the two most expensive steps:
1. Dispatch implementer with the slice's plan file path. Its dispatch prompt requires it to run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` itself and report pass/fail with output tails, plus its own visual/flow check and a report of what it confirmed.
2. No separate reviewer subagent. The controller reads the diff itself (`git diff`) and reviews it directly, focused on: the Stripe PaymentIntent re-read-before-order-creation rule (CLAUDE.md, non-negotiable), the transaction wrapping order creation + stock decrement + cart cleanup, and server-side ownership checks on orders. Everything else in the diff gets a lighter read.
3. Controller does NOT re-run the full test/lint/typecheck/build suite when the implementer's report is clean - spot-check via `git status`/`git diff --stat` against the report, same as Tier B.
4. Controller does one focused flow check of the money path only (Chrome if connected, else curl/DOM) - the Stripe payment and order-creation transaction for Checkout; order list and cancel for Orders. Skip checking non-money UI the implementer already reported on.
5. If the implementer's report or the controller's diff read shows any failure, fix or re-dispatch before committing - this only removes the *duplicate* reviewer dispatch and *duplicate* full test re-run, not the money-path scrutiny itself.
6. Commit and push.

**Tier B - all other slices (9, 10, 11, 12) and hardening/README:**
1. New session opens, reads `docs/progress.md` then this file.
2. Dispatch one Sonnet implementer subagent with the slice's plan file path (do not paste the plan into the prompt). Its dispatch prompt requires it to run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` itself and report pass/fail with output tails, plus to do its own visual check (Chrome if connected, else curl/DOM) and report what it confirmed.
3. Controller reads the report only. If it says all four checks passed and the visual check confirms the plan's key controls, skip re-running them - go straight to `git status`/`git diff --stat` to confirm the diff matches the report, then commit and push. Only re-run a check yourself if the report is missing it, ambiguous, or shows a failure.
4. Controller commits (code + `.agent-logs/`) and pushes to `main` (auto-deploys to Vercel).
5. Controller updates the status table below and the table in `docs/progress.md` with a short entry (2-3 sentences, not a full paragraph), then ends the session. Do not start the next slice in the same session.

This trades a small amount of controller-side verification rigor (on the non-money, non-auth slices only) for fitting the whole roadmap in budget. If a Tier B implementer's own report shows any failure, the controller still fixes/re-dispatches until green before committing - this only removes the *duplicate* re-run when the report is already clean.

## Usage budget (replaces the old time budget)

Slice 5 spent about 22% of usage with full controller re-verification and no reviewer; Slice 6 spent about 21% with a reviewer dispatch plus full controller re-verification, against a 9% budget. Both Tier A steps (separate reviewer subagent, full re-run of test/lint/typecheck/build) are confirmed as the biggest cost drivers, so Slices 7 and 8 move to Tier A-minus (see above) instead of repeating them. 67% of usage is spent after Slice 6, leaving 33% for the rest of the roadmap below. Track by session usage percentage, not clock time. If a session runs over its allocation, finish it (never leave `main` broken - Rule-8), record the overrun in the status column, and shrink a later Tier B slice's scope (see "What to cut") rather than the current slice's correctness.

| Slice | Plan file | Tier | Usage budget | Status |
|---|---|---|---|---|
| 3 Search | `2026-09-19-slice-3-search.md` | - | (already built) | Done |
| 4 Product page | `2026-09-19-slice-4-product.md` | - | (already built) | Done (commits `2469339`, `b36a75c`) |
| 5 Cart | `2026-09-19-slice-5-cart.md` | - | (already built, ~22% spent) | Done (commit `9c9e201`) |
| 6 Auth (sign in/up/out) | `2026-09-19-slice-6-auth.md` | A | 9% (actual: ~21%) | Done (commit `c805877`) |
| 7 Checkout (Stripe) | `2026-09-19-slice-7-checkout.md` | A-minus | 7% | Not started |
| 8 Your Orders | `2026-09-19-slice-8-orders.md` | A-minus | 6% | Not started |
| 9 Your Account | `2026-09-19-slice-9-account.md` | B | 4% | Not started |
| 10 Lists | `2026-09-19-slice-10-lists.md` | B | 3% | Not started |
| 11 Reviews | `2026-09-19-slice-11-reviews.md` | B | 3% | Not started |
| 12 History, Deals, Help | `2026-09-19-slice-12-history-deals-help.md` | B | 4% | Not started |
| Step-7 Hardening (checkout/orders paths only, per cut list) | roadmap Step-7 | B | 5% | Not started |
| Step-9 README | roadmap Step-9 | B | 2% | Not started |

Total remaining (7 through README): 7+6+4+3+3+4+5+2 = 34% against the 33% left after Slice 6 - effectively no buffer, so the Tier A-minus discipline above and the cut list below are load-bearing, not optional.

## What to cut if usage runs short

Cut in this order, stopping as soon as the remaining budget looks safe again. Never cut a slice that is already in progress to a broken state - finish it or roll back to the last working commit (Rule-8: `main` is always deployable).

1. Item 17-19 in `docs/spec.md` section 3 (demo account with seeded order-status examples, Spanish/other currencies, order confirmation emails) - all rank N, already excluded unless usage is abundant.
2. Step-7 Hardening: already reduced to the checkout and orders flows only (the money-handling paths) in the budget above; if still short, skip it entirely and record the gap in the README.
3. Tighten Tier B further: implementer's own report is trusted even more (controller does not read the full diff, just `git status`/stat and the report's pass/fail line) for Slices 10-12.
4. Polish inside a must-have slice (animations, secondary carousels, minor copy) - ship the working core control first, note the gap in `docs/progress.md` instead of iterating.
5. As a last resort, a not-yet-started Tier B slice near the end of the list (Reviews or Lists) is dropped entirely and recorded as a known gap in the README (Step-9 already asks for trade-offs made).

Never cut: anything already listed M in `docs/spec.md` section 3 that is mid-build, the safety notice, `noindex`, or the Stripe test-mode re-read-before-order-creation rule in `CLAUDE.md`. The Tier A reviewer pass now applies only to Slice 6 (already done); Slices 7 and 8 use the Tier A-minus controller-does-its-own-diff-read in place of a separate reviewer, per the revision above - this is a deliberate cost cut, not something to cut further.
