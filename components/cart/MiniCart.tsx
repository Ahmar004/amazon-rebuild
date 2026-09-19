import Link from "next/link";
import { imageAt } from "@/lib/assets";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import type { CartView } from "@/lib/data/cart";

type MiniCartProps = {
  cart: CartView;
};

// The fixed right rail on /cart/smart-wagon (recon docs/recon/3-add-to-cart-*.png): "Subtotal" in
// red, "Go to Cart", then every current line with its own stepper.
export function MiniCart({ cart }: MiniCartProps) {
  return (
    <aside className="hidden w-[125px] shrink-0 flex-col gap-3 border-l border-border bg-white px-2 py-4 md:flex">
      <p className="text-sm text-text">
        Subtotal
        <br />
        <span className="text-lg font-bold text-price-deal">{formatPrice(cart.subtotalCents)}</span>
      </p>

      <Link
        href={ROUTES.cart}
        className="rounded-full border border-border bg-white px-2 py-1.5 text-center text-xs text-text hover:bg-search-dept"
      >
        Go to Cart
      </Link>

      <div className="mt-2 flex flex-col gap-4">
        {cart.lines.map((line) => (
          <div key={line.asin} className="flex flex-col items-center gap-1 border-t border-border pt-3">
            <Link href={`/dp/${line.asin}`} className="flex h-16 w-16 items-center justify-center bg-tile-bg">
              {line.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageAt(line.imageUrl, "SY64")}
                  alt={line.title}
                  className="max-h-16 max-w-full object-contain"
                />
              )}
            </Link>
            <p className="text-xs text-text">{formatPrice(line.priceCents)}</p>
            <QuantityStepper asin={line.asin} quantity={line.quantity} maxQuantity={line.maxQuantity} />
          </div>
        ))}
      </div>
    </aside>
  );
}
