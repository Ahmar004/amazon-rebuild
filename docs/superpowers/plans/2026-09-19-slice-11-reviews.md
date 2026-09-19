# Slice 11 - Write a Review Implementation Plan (lean process)

> One Sonnet implementer; the controller checks it visually.

**Goal:** Signed-in users can write, edit and delete one review per product, with a star rating, headline and text. The "Verified Purchase" badge appears when they have a delivered order with that product. The product's star counts, average and histogram update. Signed-in users can also mark reviews "Helpful".

**Spec:** `docs/spec.md` 5.5 (reviews), 6.7; `docs/design.md` 4 (Rating), 5.3 (reviews.ts), 6.10 (Reviews), 7 (caching). Recon: `docs/recon/2-search-result-product-page-scroll-4.png`, `-5.png`.

## Global Constraints

- Match amazon.com's "Create Review" page (check the live `https://www.amazon.com/review/create-review` layout while signed out as far as it shows; otherwise follow Amazon's known layout described below). Colours only via tokens; no emojis or long dashes.
- `requireUser("/review/create-review/<asin>")`. Writes are ownership-checked. The rating update and the review write happen in one `withTransaction`: a new review increments `ratingCounts[rating-1]`; an edit decrements the old star and increments the new one; a delete decrements. `ratingCount` and `ratingAvg` are generated columns and update themselves.
- After any write, `revalidateTag("product:<asin>")` (read `node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md`).
- "Helpful": one vote per user per review (`reviewVotes` primary key); votes on your own review are not allowed; signed out goes to sign-in. The vote increments `helpfulCount` in the same transaction.
- TDD the star-count adjustment as a pure function (`adjustCounts(counts, { from?: 1..5; to?: 1..5 })`) and the review schema (rating 1 to 5 required, "Please select a star rating"; headline required, "Please enter your headline"; text required, "Please add a written review"; lengths capped at 200 / 5000). Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Reviews, end to end

**Files:** `lib/reviews/adjust.ts`, `lib/data/reviews.ts` (add `getUserReview`, `upsertReview`, `deleteReview`, `voteHelpful`), `actions/reviews.ts`, `lib/validation/review.ts`, `app/(shop)/review/create-review/[asin]/page.tsx`, `components/reviews/*` (`StarPicker` as an accessible radio group: arrow keys change the rating, hover previews it; `ReviewForm`; `HelpfulButton`); modify the product page review list (add `HelpfulButton` and "Report"; Report links out to `https://www.amazon.com/gp/help/customer/display.html`, the help page).

**Look and behaviour:**
- **Create Review page:**
  - Heading "Create Review" (28px), the product thumbnail + title, a divider.
  - "Overall rating" with five large outline stars (clickable; filled orange) and a "Clear" link.
  - "Add a headline": an input with placeholder "What's most important to know?".
  - "Add a written review": a textarea with placeholder "What did you like or dislike? What did you use this product for?".
  - A yellow "Submit" button at the right.
  - Edit mode pre-fills the existing review and adds a "Delete review" link (with a confirmation).
  - On submit, redirect to `/dp/<asin>#reviews` with a green "Review submitted - Thank you!" alert at the top of the reviews section. User reviews show the user's first name instead of "Amazon Customer".
- **Product page:** "Write a customer review" (already linking here) reads "Edit your review" when the user has one. Each review has a "Helpful" white rounded button, which becomes "Helpful" with a check plus "Thank you for your feedback." after voting, and a "Report" link.
- **Mobile:** the same form at full width.

**Steps:**
- [ ] 1. TDD `adjustCounts` and the schema. See them fail, then implement.
- [ ] 2. Implement the data functions with transactions and cache revalidation, and the pages and components.
- [ ] 3. Verify in the browser: write a 5-star review (the histogram and average change after reload), edit it to 1 star (counts move), delete it (counts return), the verified badge after a delivered order (use Slice 8's backdating script technique), helpful vote once, and no voting on your own review. Use mobile via the 390px iframe trick.
- [ ] 4. Run tests, lint, typecheck and build; commit "Slice 11: write, edit and delete reviews, helpful votes".

Write the report to `.superpowers/sdd/2026-09-19-slice-11-reviews/report.md`.
