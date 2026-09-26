"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { imageAt } from "@/lib/assets";
import { formatPrice } from "@/lib/pricing/money";
import { productHref, ROUTES } from "@/lib/constants/links";

// The slide-in cart (C8): the shopper edits the cart without leaving the page they're on. /cart
// stays for saved-for-later items and a full-page view.
export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, setQuantity } = useCart();
  const toast = useToast();
  const close = () => setDrawerOpen(false);

  async function change(asin: string, next: number) {
    const result = await setQuantity(asin, next);
    if (!result.ok) toast(result.error, "error");
    else if (next <= 0) toast("Removed from your cart");
  }

  const count = cart?.itemCount ?? 0;
  const lines = cart?.lines ?? [];

  return (
    <Sheet
      open={drawerOpen}
      onClose={close}
      side="right"
      title={count ? `Your cart (${count})` : "Your cart"}
      footer={
        cart && lines.length > 0 ? (
          <div className="space-y-3">
            <p className="flex items-baseline justify-between text-base text-fg">
              Subtotal <span className="text-lg font-bold">{formatPrice(cart.subtotalCents)}</span>
            </p>
            <p className="text-xs text-fg-muted">Shipping and tax are worked out at checkout.</p>
            <Link href={ROUTES.checkout} onClick={close} className={buttonClass({ full: true, size: "lg", className: "rounded-full" })}>
              Checkout
            </Link>
            <Link href={ROUTES.cart} onClick={close} className={buttonClass({ variant: "secondary", full: true, className: "rounded-full" })}>
              View full cart
            </Link>
          </div>
        ) : undefined
      }
    >
      {!cart ? (
        <div className="space-y-3 p-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ShoppingCart size={28} aria-hidden="true" />
          </span>
          <p className="text-lg font-semibold text-fg">Your cart is empty</p>
          <p className="text-sm text-fg-muted">Items you add show up here.</p>
          <Link href={ROUTES.deals} onClick={close} className={buttonClass({ className: "mt-2 rounded-full" })}>
            Browse today&apos;s deals
          </Link>
          <Link href={ROUTES.cart} onClick={close} className="text-sm text-accent hover:underline">
            See saved for later
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <FreeShippingBar progress={cart.freeShipping} />
          <ul className="divide-y divide-border">
            {lines.map((line) => (
              <li key={line.asin} className="flex gap-3 py-3">
                <Link
                  href={productHref(line.asin)}
                  onClick={close}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1"
                >
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageAt(line.imageUrl, "SY160")} alt="" className="max-h-full max-w-full object-contain" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={productHref(line.asin)} onClick={close} className="line-clamp-2 text-sm text-fg hover:text-accent">
                    {line.title}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-fg">{formatPrice(line.lineTotalCents)}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper
                      quantity={line.quantity}
                      maxQuantity={line.maxQuantity}
                      onChange={(next) => change(line.asin, next)}
                    />
                    <button
                      type="button"
                      onClick={() => change(line.asin, 0)}
                      aria-label={`Remove ${line.title} from cart`}
                      className="text-sm text-fg-muted hover:text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
