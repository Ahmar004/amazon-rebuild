import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { Price } from "@/components/product/Price";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistHeart } from "@/components/wishlist/WishlistHeart";
import { imageAt } from "@/lib/assets";
import { discountPercent } from "@/lib/pricing/money";
import { productHref } from "@/lib/constants/links";
import type { ProductSummary } from "@/lib/data/products";

type ProductCardProps = {
  item: ProductSummary;
  /** Optional line under the price, e.g. the wishlist's price-drop note. */
  note?: React.ReactNode;
};

// The one product card used by rails, the search grid, deals and the wishlist (frontend-rebuild.md
// C6, C7): photo, badges, brand, title, rating, price and Add to cart. It lifts on hover and the
// photo zooms slightly, so a grid feels alive without moving anything around it.
export function ProductCard({ item, note }: ProductCardProps) {
  const href = productHref(item.asin);
  const percent = discountPercent(item.priceCents, item.listPriceCents);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-surface p-3 shadow-card transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-pop">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white p-3">
          {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- dataset image, pre-sized by URL
            <img
              src={imageAt(item.imageUrl, "SY300")}
              alt=""
              loading="lazy"
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {percent !== null && <Badge tone="deal">-{percent}%</Badge>}
          {item.isBestSeller && <Badge tone="warning">Best Seller</Badge>}
        </div>
        <div className="absolute right-2 top-2">
          <WishlistHeart asin={item.asin} />
        </div>
      </div>

      <p className="mt-3 truncate text-xs font-semibold uppercase tracking-wide text-fg-muted">{item.brand}</p>
      <Link href={href} className="mt-0.5 line-clamp-2 text-sm font-medium text-fg hover:text-accent">
        {item.title}
      </Link>
      {item.ratingCount > 0 && (
        <div className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
          <Stars rating={item.ratingAvg} size={12} />
          <span>{item.ratingCount.toLocaleString("en-US")}</span>
        </div>
      )}
      <div className="mt-1.5">
        <Price priceCents={item.priceCents} listPriceCents={item.listPriceCents} variant="compact" />
      </div>
      {note}
      <div className="mt-auto pt-3">
        {item.stock > 0 ? (
          <AddToCartButton asin={item.asin} full />
        ) : (
          <p className="text-center text-sm text-fg-muted">Currently unavailable</p>
        )}
      </div>
    </article>
  );
}
