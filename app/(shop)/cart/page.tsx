import { Suspense } from "react";
import Link from "next/link";
import { getCartOwner } from "@/lib/cart-owner";
import { getCart } from "@/lib/data/cart";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { CartLine } from "@/components/cart/CartLine";
import { SavedForLater } from "@/components/cart/SavedForLater";
import { SubtotalBox } from "@/components/cart/SubtotalBox";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { freeShippingProgress } from "@/lib/pricing/shipping";

// /cart (recon docs/recon/4-shopping-cart-scroll-*.png). Reads the cart_token cookie via
// getCartOwner, so it renders inside <Suspense> rather than under 'use cache' (CLAUDE.md).
export default function CartPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageContent />
    </Suspense>
  );
}

async function CartPageContent() {
  const owner = await getCartOwner();
  const signedIn = owner !== null && "userId" in owner;
  const checkoutHref = signedIn ? ROUTES.checkout : `${ROUTES.signIn}?return_to=${encodeURIComponent(ROUTES.checkout)}`;
  const cart = owner ? await getCart(owner) : { lines: [], saved: [], subtotalCents: 0, itemCount: 0 };
  const isCompletelyEmpty = cart.lines.length === 0 && cart.saved.length === 0;

  if (isCompletelyEmpty) {
    return (
      <div className="min-h-[60vh] bg-bg px-4 py-8">
        <div className="mx-auto max-w-[600px]">
          <EmptyCart signedIn={signedIn} />
        </div>
      </div>
    );
  }

  const itemsLabel = `${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`;

  return (
    <div className="min-h-[60vh] bg-bg px-4 py-6">
      {cart.lines.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4 md:hidden">
          <p className="text-lg text-fg">
            Subtotal <span className="font-bold">{formatPrice(cart.subtotalCents)}</span>
          </p>
          <Link
            href={checkoutHref}
            className="mt-3 block w-full rounded-full border border-accent bg-accent px-3 py-2 text-center text-sm text-accent-fg hover:bg-accent-hover"
          >
            Proceed to checkout ({itemsLabel})
          </Link>
        </div>
      )}

      <div className="mx-auto flex max-w-[1000px] flex-col gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h1 className="text-[28px] text-fg">Shopping Cart</h1>
              {cart.lines.length > 0 && <span className="hidden text-sm text-fg-muted md:inline">Price</span>}
            </div>

            {cart.lines.length === 0 ? (
              <EmptyCart compact />
            ) : (
              <>
                <div className="pt-4">
                  <FreeShippingBar progress={freeShippingProgress(cart.subtotalCents)} />
                </div>
                {cart.lines.map((line) => (
                  <CartLine key={line.asin} line={line} />
                ))}
                <p className="pt-4 text-right text-lg text-fg">
                  Subtotal ({itemsLabel}): <span className="font-bold">{formatPrice(cart.subtotalCents)}</span>
                </p>
              </>
            )}
          </div>

          {cart.lines.length > 0 && (
            <p className="mt-4 text-xs text-fg-muted">
              Prices and availability are subject to change. The Cart is a temporary
              place to store a list of your items and reflects each item&apos;s most recent price.{" "}
              <Link href={ROUTES.customerService} className="text-accent hover:text-accent-hover">
                Learn more
              </Link>
              . Do you have a gift card or promotional code? We&apos;ll ask you to enter your claim code when
              it&apos;s time to pay.
            </p>
          )}

          <SavedForLater items={cart.saved} />
        </div>

        {cart.lines.length > 0 && (
          <div className="hidden w-[300px] shrink-0 md:block">
            <SubtotalBox itemCount={cart.itemCount} subtotalCents={cart.subtotalCents} checkoutHref={checkoutHref} />
          </div>
        )}
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="min-h-[60vh] bg-bg px-4 py-6" aria-hidden="true">
      <div className="mx-auto max-w-[1000px]">
        <div className="h-[400px] animate-pulse rounded-lg bg-surface" />
      </div>
    </div>
  );
}
