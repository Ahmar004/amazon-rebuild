import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ListingActions } from "@/components/listings/ListingActions";
import { productHref } from "@/lib/constants/links";
import { LISTING_STATUS, LISTING_STATUS_LABEL } from "@/lib/constants/listings";
import { formatPrice } from "@/lib/pricing/money";
import type { SellerListingRow } from "@/lib/data/listings";

const LISTED_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

// "Your listings": one card per listing with its photo, price, stock, sales and status, plus the
// seller's actions. Paused listings are dimmed, because buyers can't see them.
export function ListingList({ listings }: { listings: SellerListingRow[] }) {
  return (
    <ul className="space-y-3">
      {listings.map((listing, index) => {
        const paused = listing.status === LISTING_STATUS.paused;
        return (
          <li
            key={listing.asin}
            className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-card animate-[rise-in_400ms_cubic-bezier(0.2,0.7,0.2,1)_both] sm:flex-row sm:items-center"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <Link href={productHref(listing.asin)} className={`flex min-w-0 flex-1 gap-4 ${paused ? "opacity-60" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={listing.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg border border-border bg-white object-contain" />
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold text-fg hover:text-accent">{listing.title}</p>
                <p className="mt-1 text-sm text-fg">
                  <span className="font-bold">{formatPrice(listing.priceCents)}</span>
                  <span className="text-fg-muted"> · </span>
                  {listing.stock > 0 ? <span>{listing.stock} in stock</span> : <span className="text-deal">Out of stock</span>}
                  <span className="text-fg-muted"> · {listing.unitsSold} sold</span>
                </p>
                <p className="mt-0.5 text-xs text-fg-muted">Listed {LISTED_DATE.format(listing.createdAt)}</p>
              </div>
            </Link>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge tone={paused ? "warning" : "accent"}>{LISTING_STATUS_LABEL[listing.status]}</Badge>
              <ListingActions asin={listing.asin} status={listing.status} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
