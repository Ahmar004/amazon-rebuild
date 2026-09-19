import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { ROUTES } from "@/lib/constants/links";

// Cart icon with item count and "Cart" label. count is a prop for now (Slice 5 will feed the
// real cartCount into it); this slice's layout passes 0.
export function CartLink({ count }: { count: number }) {
  return (
    <Link
      href={ROUTES.cart}
      className="flex items-end rounded-sm border border-transparent px-[9px] py-1 text-white hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span className="relative">
        <Sprite name="cart" />
        <span
          className="absolute left-[3px] top-[-2px] text-lg font-bold text-cart-count"
          aria-hidden="true"
        >
          {count}
        </span>
      </span>
      <span className="ml-1 text-sm font-bold">
        Cart
        <span className="sr-only"> ({count} items)</span>
      </span>
    </Link>
  );
}
