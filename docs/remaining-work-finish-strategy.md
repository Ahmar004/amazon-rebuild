# Remaining Work Finish Strategy

Written under Rule-0.0A (`roadmap.md`) at 2026-09-19 ~15:50 UTC (20:50 PKT), deadline 2026-09-19 21:50 UTC (02:50 PKT). This doc is the fixed plan; only the status column changes as slices land. Each new session reads `docs/progress.md` for current status, this doc for the plan, and only the one plan file (`docs/superpowers/plans/...`) for the slice it is about to build - not `spec.md`, `tech-stack.md` or `design.md` again, those are already baked into the plan files.

## Why sessions must stay short

Every extra turn in a long session re-sends the whole conversation, so tokens (and cost) grow with context size, not just with work done. A fresh session per slice keeps each session's context small: read progress.md + this file + one plan file (a few thousand tokens) instead of an ever-growing transcript. This is the same reasoning as roadmap Rule-0.0, applied per slice instead of per day.

## Session shape (repeat per slice)

1. New session opens, reads `docs/progress.md` then this file.
2. Dispatch one Sonnet implementer subagent with the slice's plan file path (do not paste the plan into the prompt).
3. Controller (Opus) checks the result: tests/lint/typecheck/build, then a visual check against amazon.com (screenshots at scale 0.5, few of them).
4. Slices 6, 7, 8 (auth, checkout, orders) additionally get a Sonnet reviewer subagent before the visual check, per `CLAUDE.md`.
5. Controller commits (code + `.agent-logs/`) and pushes to `main` (auto-deploys to Vercel).
6. Controller updates the status table below and the table in `docs/progress.md`, then ends the session. Do not start the next slice in the same session.

## Time budget

Budget assumes 5h40m from 20:50 PKT. Each row is one session. If a slice runs over budget, finish it (never leave `main` broken - Rule-8) but skip straight to updating status and stopping; do not try to claw back time on the next slice by cutting its own visual check.

| Slice | Plan file | Budget | Status |
|---|---|---|---|
| 3 Search | `2026-09-19-slice-3-search.md` | (already built) | Verifying now (this session) |
| 4 Product page | `2026-09-19-slice-4-product.md` | 35 min | Not started |
| 5 Cart | `2026-09-19-slice-5-cart.md` | 30 min | Not started |
| 6 Auth (sign in/up/out) | `2026-09-19-slice-6-auth.md` | 40 min (+reviewer) | Not started |
| 7 Checkout (Stripe) | `2026-09-19-slice-7-checkout.md` | 45 min (+reviewer) | Not started |
| 8 Your Orders | `2026-09-19-slice-8-orders.md` | 40 min (+reviewer) | Not started |
| 9 Your Account | `2026-09-19-slice-9-account.md` | 35 min | Not started |
| 10 Lists | `2026-09-19-slice-10-lists.md` | 25 min | Not started |
| 11 Reviews | `2026-09-19-slice-11-reviews.md` | 25 min | Not started |
| 12 History, Deals, Help | `2026-09-19-slice-12-history-deals-help.md` | 30 min | Not started |
| Step-7 Hardening | roadmap Step-7 | 20 min | Not started |
| Step-9 README | roadmap Step-9 | 15 min | Not started |

Total: about 5h30m, leaving a 10 minute buffer.

## What to cut if time runs short

Cut in this order, stopping as soon as the remaining budget looks safe again. Never cut a slice that is already in progress to a broken state - finish it or roll back to the last working commit (Rule-8: `main` is always deployable).

1. Item 17-19 in `docs/spec.md` section 3 (demo account with seeded order-status examples, Spanish/other currencies, order confirmation emails) - all rank N, already excluded unless time is abundant.
2. Step-7 Hardening: reduce to the checkout and orders flows only (the money-handling paths), skip the full concurrent-load check.
3. Polish inside a must-have slice (animations, secondary carousels, minor copy) - ship the working core control first, note the gap in `docs/progress.md` instead of iterating.
4. As a last resort, a not-yet-started slice near the end of the list (Reviews or Lists) is dropped entirely and recorded as a known gap in the README (Step-9 already asks for trade-offs made).

Never cut: anything already listed M in `docs/spec.md` section 3 that is mid-build, the safety notice, `noindex`, or the Stripe test-mode re-read-before-order-creation rule in `CLAUDE.md`.
