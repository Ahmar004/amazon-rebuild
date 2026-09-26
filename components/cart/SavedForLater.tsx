import Link from "next/link";
import { imageAt } from "@/lib/assets";
import { formatPrice } from "@/lib/pricing/money";
import { SavedItemActions } from "@/components/cart/CartLineActions";
import type { CartLine } from "@/lib/data/cart";
import { productHref } from "@/lib/constants/links";

type SavedForLaterProps = {
  items: CartLine[];
};

// The "Saved for later (n items)" box below the cart lines (recon docs/recon/4-shopping-cart-*).
export function SavedForLater({ items }: SavedForLaterProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface p-4">
      <h2 className="border-b border-border pb-3 text-lg font-bold text-fg">
        Saved for later ({items.length} {items.length === 1 ? "item" : "items"})
      </h2>

      {items.map((item) => (
        <div key={item.asin} className="flex gap-4 border-b border-border py-4 last:border-b-0">
          <Link href={productHref(item.asin)} className="flex w-[100px] shrink-0 items-center justify-center bg-surface-muted">
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageAt(item.imageUrl, "SY100")}
                alt={item.title}
                className="max-h-[100px] w-full object-contain"
              />
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link href={productHref(item.asin)} className="text-sm text-fg hover:text-accent-hover">
              {item.title}
            </Link>
            <p className="mt-1 font-bold text-fg">{formatPrice(item.priceCents)}</p>
            <div className="mt-2 flex gap-3 text-sm">
              <SavedItemActions asin={item.asin} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
