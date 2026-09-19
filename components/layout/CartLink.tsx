import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { navItemClass } from "@/components/layout/navItemClass";
import { ROUTES } from "@/lib/constants/links";

type CartLinkProps = {
  count: number;
  /** "mobile" drops the "Cart" label for HeaderMobile's compact row 1 (Task 4). */
  variant?: "desktop" | "mobile";
};

// Cart icon with item count and "Cart" label. count is a prop for now (Slice 5 will feed the
// real cartCount into it); this slice's layout passes 0.
export function CartLink({ count, variant = "desktop" }: CartLinkProps) {
  if (variant === "mobile") {
    return (
      <Link href={ROUTES.cart} className={`flex shrink-0 items-center ${navItemClass}`}>
        <span className="relative">
          <Sprite name="cart" />
          <span
            className="absolute left-[3px] top-[-2px] text-lg font-bold text-cart-count"
            aria-hidden="true"
          >
            {count}
          </span>
        </span>
        <span className="sr-only">Cart ({count} items)</span>
      </Link>
    );
  }

  return (
    <Link href={ROUTES.cart} className={`flex shrink-0 items-end ${navItemClass}`}>
      <span className="relative">
        <Sprite name="cart" />
        <span
          className="absolute left-[3px] top-[-2px] text-lg font-bold text-cart-count"
          aria-hidden="true"
        >
          {count}
        </span>
      </span>
      <span className="ml-1 whitespace-nowrap text-sm font-bold">
        Cart
        <span className="sr-only"> ({count} items)</span>
      </span>
    </Link>
  );
}
