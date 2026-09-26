import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ROUTES } from "@/lib/constants/links";

// Cart icon with an item-count badge and a "Cart" label that hides on narrow screens.
export function CartLink({ count, className }: { count: number; className?: string }) {
  return (
    <Link href={ROUTES.cart} className={`relative flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 ${className ?? ""}`}>
      <span className="relative">
        <ShoppingCart size={22} aria-hidden="true" />
        {count > 0 && (
          <span
            className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-accent-fg"
            aria-hidden="true"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden text-sm font-semibold sm:inline">Cart</span>
      <span className="sr-only">({count} items)</span>
    </Link>
  );
}
