import Link from "next/link";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ListingActions } from "@/components/listings/ListingActions";
import { ROUTES } from "@/lib/constants/links";
import { LISTING_STATUS, LISTING_STATUS_LABEL } from "@/lib/constants/listings";
import type { ProductDetail } from "@/lib/data/products";

// The purchase panel a seller sees on their own listing: its status and stock, and the listing
// actions, in place of Add to cart and Buy now.
export function OwnListingPanel({ product }: { product: ProductDetail }) {
  const paused = product.status === LISTING_STATUS.paused;
  return (
    <div className="rounded-lg bg-accent-soft/60 p-4 text-sm text-fg">
      <p className="flex items-center gap-2 font-bold">
        <Store size={16} aria-hidden="true" />
        This is your listing
        <Badge tone={paused ? "warning" : "accent"}>{LISTING_STATUS_LABEL[product.status]}</Badge>
      </p>
      <p className="mt-1 text-fg-muted">
        {paused ? "Buyers can't see or buy it while it's paused." : product.stock > 0 ? `${product.stock} in stock and visible to every shopper.` : "Out of stock, so buyers can't order it."}
      </p>
      <div className="mt-3">
        <ListingActions asin={product.asin} status={product.status} />
      </div>
      <Link href={ROUTES.sellerListings} className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
        See all your listings
      </Link>
    </div>
  );
}
