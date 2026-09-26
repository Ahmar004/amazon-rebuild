"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ROUTES } from "@/lib/constants/links";
import { useCart } from "@/components/cart/CartProvider";

const WRAPPER = "relative flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-fg hover:bg-surface-muted";

function CartIcon({ count }: { count: number }) {
  return (
    <>
      <span className="relative">
        <ShoppingCart size={22} aria-hidden="true" />
        {count > 0 && (
          <span
            key={count}
            className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] animate-[pop_250ms_ease-out] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-accent-fg"
            aria-hidden="true"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-semibold sm:inline">Cart</span>
      <span className="sr-only">({count} items)</span>
    </>
  );
}

// Cart icon on the checkout header: a plain link with the server-read count.
export function CartLink({ count }: { count: number }) {
  return (
    <Link href={ROUTES.cart} className={WRAPPER}>
      <CartIcon count={count} />
    </Link>
  );
}

// Cart icon on the storefront header: opens the cart drawer and shows the live count.
export function CartButton() {
  const { cart, setDrawerOpen } = useCart();
  return (
    <button type="button" onClick={() => setDrawerOpen(true)} aria-haspopup="dialog" className={WRAPPER}>
      <CartIcon count={cart?.itemCount ?? 0} />
    </button>
  );
}
