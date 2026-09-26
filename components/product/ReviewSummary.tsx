import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { reviewsUrl } from "@/lib/reviews/query";
import type { StarPercents } from "@/lib/reviews/histogram";

type ReviewSummaryProps = {
  average: number;
  count: number;
  percents: StarPercents;
};

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

// Every star-filter link below resets the page to 1 regardless of the current query (reviewsUrl's
// contract), so this component doesn't need the current ReviewsQuery as a prop - it can stay
// part of the page's cached shell instead of depending on request-time searchParams.
const LINK_BASE = { star: undefined, page: 1 } as const;

// Left column of the Reviews tab (frontend-rebuild.md C10): average stars, rating count and the
// 5-to-1 star histogram, each row linking to that star filter.
export function ReviewSummary({ average, count, percents }: ReviewSummaryProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-fg">Customer reviews</h2>

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
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                <span className="block h-full rounded-full bg-star" style={{ width: `${percents[star]}%` }} />
              </span>
              <span className="w-10 text-right text-fg-muted">{percents[star]}%</span>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
