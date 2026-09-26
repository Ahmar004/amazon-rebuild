import Link from "next/link";
import { imageAt } from "@/lib/assets";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { ShareButton } from "@/components/product/ShareButton";
import { SaveForLaterButton } from "@/components/cart/SaveForLaterButton";
import { DeleteLineButton } from "@/components/cart/DeleteLineButton";
import type { CartLine as CartLineType } from "@/lib/data/cart";

const LOW_STOCK_THRESHOLD = 10;

type CartLineProps = {
  line: CartLineType;
};

// One /cart line (recon docs/recon/4-shopping-cart-scroll-*.png): image, title, stock status,
// shipping/gift-options copy, then the stepper / Delete / Save for later / Share row, with the
// price bold at the right. Desktop and mobile share this markup, reflowed with responsive classes
// (same pattern as components/search/ResultRow.tsx).
export function CartLine({ line }: CartLineProps) {
  const href = `/dp/${line.asin}`;

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:gap-4">
      <Link href={href} className="flex w-full shrink-0 items-center justify-center bg-surface-muted sm:w-[180px]">
        {line.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageAt(line.imageUrl, "SY180")}
            alt={line.title}
            className="max-h-[180px] w-full object-contain"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1">
          <Link href={href} className="text-base text-fg hover:text-accent-hover">
            {line.title}
          </Link>

          <StockLine stock={line.stock} />

          <p className="mt-1 text-sm text-fg">Ships from and sold by Shopeedo</p>
          <p className="mt-1 text-sm text-fg">
            Gift options not available.{" "}
            <Link href={ROUTES.customerService} className="text-accent hover:text-accent-hover">
              Learn more
            </Link>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <QuantityStepper asin={line.asin} quantity={line.quantity} maxQuantity={line.maxQuantity} />
            <DeleteLineButton asin={line.asin} />
            <SaveForLaterButton asin={line.asin} />
            <ShareButton path={href} />
          </div>
        </div>

        <div className="text-left font-bold text-fg sm:text-right">{formatPrice(line.lineTotalCents)}</div>
      </div>
    </div>
  );
}

function StockLine({ stock }: { stock: number }) {
  if (stock === 0) {
    return <p className="mt-1 text-sm text-deal">Currently unavailable</p>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <p className="mt-1 text-sm text-deal">Only {stock} left in stock - order soon.</p>;
  }
  return <p className="mt-1 text-sm text-success">In Stock</p>;
}
