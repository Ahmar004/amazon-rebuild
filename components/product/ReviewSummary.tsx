import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { reviewsUrl } from "@/lib/reviews/query";
import type { StarPercents } from "@/lib/reviews/histogram";

type ReviewSummaryProps = {
  asin: string;
  average: number;
  count: number;
  percents: StarPercents;
};

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

// Every star-filter link below resets the page to 1 regardless of the current query (reviewsUrl's
// contract), so this component doesn't need the current ReviewsQuery as a prop - it can stay
// part of the page's cached shell instead of depending on request-time searchParams.
const LINK_BASE = { star: undefined, page: 1 } as const;

// Left column of the reviews section (docs/spec.md 5.5): average stars, global rating count, and
// the 5-to-1 star histogram, each row linking to a filtered view.
export function ReviewSummary({ asin, average, count, percents }: ReviewSummaryProps) {
  return (
    <div className="md:w-[300px] md:shrink-0">
      <h2 className="text-xl font-bold text-fg">Customer reviews</h2>

      <div className="mt-3 flex items-center gap-2">
        <Stars rating={average} size={20} />
        <span className="text-base text-fg">{average} out of 5</span>
      </div>
      <p className="mt-1 text-sm text-fg-muted">{count.toLocaleString("en-US")} global ratings</p>

      {count > 0 && (
        <div className="mt-4 space-y-1">
          {STAR_ROWS.map((star) => (
            <Link
              key={star}
              href={reviewsUrl(LINK_BASE, { star })}
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <span className="w-10 text-accent">{star} star</span>
              <span className="h-[10px] flex-1 overflow-hidden rounded border border-border bg-surface-muted">
                <span className="block h-full bg-star" style={{ width: `${percents[star]}%` }} />
              </span>
              <span className="w-10 text-right text-fg-muted">{percents[star]}%</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <p className="text-base font-bold text-fg">Review this product</p>
        <p className="text-sm text-fg-muted">Share your thoughts with other customers</p>
        <Link
          href={`/review/create-review/${asin}`}
          className="mt-3 block w-full rounded-xl border border-border bg-surface px-4 py-1.5 text-center text-sm hover:bg-surface-muted"
        >
          Write a customer review
        </Link>
      </div>
    </div>
  );
}
