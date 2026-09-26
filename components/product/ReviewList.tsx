import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { ReviewBody } from "@/components/product/ReviewBody";
import { REVIEWS_PAGE_SIZE, type Review } from "@/lib/data/reviews";
import { reviewsUrl, type ReviewsQuery } from "@/lib/reviews/query";
import { countLabel } from "@/lib/format/count";

type ReviewListProps = {
  reviews: Review[];
  total: number;
  query: ReviewsQuery;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

// The right column of the reviews section: "Top reviews from the United States", the active
// star filter banner, and the review list with "See more reviews" paging (docs/spec.md 5.5).
// The "Helpful" button is omitted (voting needs sign-in, Slice 11).
export function ReviewList({ reviews, total, query }: ReviewListProps) {
  const hasMore = query.page * REVIEWS_PAGE_SIZE < total;

  return (
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-bold text-fg">Top reviews</h2>

      {query.star && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-fg">
          <span>Showing {query.star} star reviews</span>
          <Link href={reviewsUrl(query, { star: undefined })} className="text-accent hover:text-accent-hover hover:underline">
            Clear filter
          </Link>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-fg-muted">There are no reviews for this filter.</p>
      ) : (
        <ul className="mt-4">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-border py-6 first:pt-4">
              <div className="flex items-center gap-2">
                <PersonIcon />
                <span className="text-sm text-fg">{review.authorName}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={review.rating} />
                <span className="text-sm font-bold text-fg">{review.title}</span>
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                Reviewed on {DATE_FORMATTER.format(review.createdAt)}
              </p>
              {review.verified && (
                <p className="mt-1 text-xs font-bold text-success">Verified purchase</p>
              )}
              <div className="mt-2">
                <ReviewBody body={review.body} />
              </div>
              {review.helpfulCount > 0 && (
                <p className="mt-2 text-xs text-fg-muted">
                  {countLabel(review.helpfulCount, "person", "people")} found this helpful
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <Link
          href={reviewsUrl(query, { page: query.page + 1 })}
          className="mt-2 inline-block text-sm text-accent hover:text-accent-hover hover:underline"
        >
          See more reviews
        </Link>
      )}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="var(--color-border)" />
      <circle cx="16" cy="13" r="5" fill="white" />
      <path d="M4 28 a12 10 0 0 1 24 0 Z" fill="white" />
    </svg>
  );
}
