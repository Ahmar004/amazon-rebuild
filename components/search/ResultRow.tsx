import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { Price } from "@/components/product/Price";
import { imageAt } from "@/lib/assets";
import { deliveryDate, formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { FREE_SHIPPING_THRESHOLD_CENTS, shippingCents } from "@/lib/pricing/shipping";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import type { ProductSummary } from "@/lib/data/products";

const LOW_STOCK_THRESHOLD = 10;

type ResultRowProps = {
  item: ProductSummary;
  now: Date;
};

// One search result: image, title, rating, price, delivery line and an "Add to cart" button,
// list layout on desktop and a 2-column layout on mobile (docs/design.md 6.3).
export function ResultRow({ item, now }: ResultRowProps) {
  const href = `/dp/${item.asin}`;
  const freeShipping = item.priceCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const eta = formatDeliveryDate(deliveryDate(now, "standard"));

  return (
    <div className="flex gap-4 border-b border-border py-4 md:gap-6">
      <Link href={href} className="flex w-[40%] shrink-0 items-center justify-center bg-surface-muted md:w-[240px]">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageAt(item.imageUrl, "UL320")} alt={item.title} className="h-full max-h-[240px] w-full object-contain" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {item.isBestSeller && (
          <span className="mb-1 inline-block bg-warning px-1.5 py-0.5 text-xs font-bold text-white">
            Best Seller
          </span>
        )}

        <Link href={href} className="block">
          <p className="text-sm font-bold text-fg">{item.brand}</p>
          <h2 className="line-clamp-2 text-base text-fg hover:text-accent-hover md:text-lg">{item.title}</h2>
        </Link>

        {item.ratingCount > 0 && (
          <Link href={`${href}#reviews`} className="mt-1 flex items-center gap-1 text-sm">
            <span className="text-fg">{item.ratingAvg}</span>
            <Stars rating={item.ratingAvg} />
            <span className="text-accent hover:text-accent-hover">{item.ratingCount.toLocaleString("en-US")}</span>
          </Link>
        )}

        <div className="mt-1">
          <Price priceCents={item.priceCents} listPriceCents={item.listPriceCents} />
        </div>

        <p className="mt-1 text-sm text-fg">
          {freeShipping ? "FREE delivery" : `${formatPrice(shippingCents(item.priceCents, "standard"))} delivery`}{" "}
          <span className="font-bold">{eta}</span>
        </p>

        {item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0 && (
          <p className="mt-1 text-sm text-deal">Only {item.stock} left in stock - order soon.</p>
        )}

        {item.stock > 0 && (
          <div className="mt-2">
            <AddToCartButton asin={item.asin} />
          </div>
        )}
      </div>
    </div>
  );
}
