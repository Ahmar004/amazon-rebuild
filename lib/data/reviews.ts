import { sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, withTransaction } from "@/lib/db/client";
import { averageRating, histogramPercents, totalRatings, type StarPercents } from "@/lib/reviews/histogram";

export const REVIEWS_PAGE_SIZE = 8;

export type Review = {
  id: number;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
};

export type ReviewSummary = { average: number; count: number; percents: StarPercents };

export type GetReviewsOptions = { star?: 1 | 2 | 3 | 4 | 5; page: number };

// Pure WHERE-clause builder (mirrors lib/data/search.ts's buildSearchConditions), kept separate
// from getReviews so tests/unit/data/reviews.test.ts can check it without a database.
export function buildReviewConditions(asin: string, star?: 1 | 2 | 3 | 4 | 5): SQL[] {
  const conditions: SQL[] = [sql`asin = ${asin}`];
  if (star) {
    conditions.push(sql`rating = ${star}`);
  }
  return conditions;
}

// Built from the product's rating_counts array (lib/reviews/histogram.ts, already tested), not
// from a scan of the reviews table - the dataset's ratings and our own reviews both roll up into
// that one array (docs/spec.md 6.7).
export async function getReviewSummary(asin: string): Promise<ReviewSummary> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product:${asin}`);

  const result = await db.execute<{ rating_counts: number[] }>(
    sql`select rating_counts from products where asin = ${asin}`,
  );
  const counts = result.rows[0]?.rating_counts ?? [0, 0, 0, 0, 0];

  return {
    average: averageRating(counts),
    count: totalRatings(counts),
    percents: histogramPercents(counts),
  };
}

type ReviewRow = {
  id: number;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful_count: number;
  created_at: string;
};

export async function getReviews(asin: string, opts: GetReviewsOptions): Promise<{ items: Review[]; total: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product:${asin}`);

  const where = sql.join(buildReviewConditions(asin, opts.star), sql` and `);
  const offset = (opts.page - 1) * REVIEWS_PAGE_SIZE;

  const totalResult = await db.execute<{ total: number }>(
    sql`select count(*)::int as total from reviews where ${where}`,
  );
  const total = totalResult.rows[0]?.total ?? 0;

  const rowsResult = await db.execute<ReviewRow>(sql`
    select id, author_name, rating, title, body, verified, helpful_count, created_at
    from reviews
    where ${where}
    order by created_at desc
    limit ${REVIEWS_PAGE_SIZE} offset ${offset}
  `);

  const items = rowsResult.rows.map((row) => ({
    id: row.id,
    authorName: row.author_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    verified: row.verified,
    helpfulCount: row.helpful_count,
    createdAt: new Date(row.created_at),
  }));

  return { items, total: Number(total) };
}

// Writing reviews (frontend-rebuild.md C19): only a user with a non-cancelled order containing the
// product may review it, once. The check, the insert and the rating roll-up run in one
// transaction, so a product's rating_counts always matches its reviews.

export type ReviewEligibility = "eligible" | "not-purchased" | "already-reviewed";

export const REVIEW_NOT_ALLOWED: Record<Exclude<ReviewEligibility, "eligible">, string> = {
  "not-purchased": "Only customers who bought this item can review it.",
  "already-reviewed": "You have already reviewed this product.",
};

export class ReviewNotAllowedError extends Error {}

const purchased = (userId: string, asin: string) => sql`exists (
  select 1 from order_items oi join orders o on o.id = oi.order_id
  where o.user_id = ${userId} and o.cancelled_at is null and oi.asin = ${asin})`;
const reviewed = (userId: string, asin: string) => sql`exists (
  select 1 from reviews where user_id = ${userId} and asin = ${asin})`;

type EligibilityRow = { purchased: boolean; reviewed: boolean };

function eligibilityOf(row: EligibilityRow | undefined): ReviewEligibility {
  if (row?.reviewed) return "already-reviewed";
  if (!row?.purchased) return "not-purchased";
  return "eligible";
}

export async function getReviewEligibility(userId: string, asin: string): Promise<ReviewEligibility> {
  const result = await db.execute<EligibilityRow>(
    sql`select ${purchased(userId, asin)} as purchased, ${reviewed(userId, asin)} as reviewed`,
  );
  return eligibilityOf(result.rows[0]);
}

export type NewReview = { userId: string; authorName: string; asin: string; rating: number; title: string; body: string };

export async function createReview(review: NewReview): Promise<void> {
  await withTransaction(async (tx) => {
    const check = await tx.execute<EligibilityRow>(
      sql`select ${purchased(review.userId, review.asin)} as purchased, ${reviewed(review.userId, review.asin)} as reviewed`,
    );
    const eligibility = eligibilityOf(check.rows[0]);
    if (eligibility !== "eligible") throw new ReviewNotAllowedError(REVIEW_NOT_ALLOWED[eligibility]);

    // The unique (asin, user_id) index backs up the check above if two submits race.
    await tx.execute(sql`
      insert into reviews (asin, user_id, author_name, rating, title, body, verified, source)
      values (${review.asin}, ${review.userId}, ${review.authorName}, ${review.rating}, ${review.title}, ${review.body}, true, 'user')`);
    await tx.execute(sql`
      update products set rating_counts[${review.rating}::int] = rating_counts[${review.rating}::int] + 1
      where asin = ${review.asin}`);
  });
}
