"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { ROUTES } from "@/lib/constants/links";

// Header heart with the wishlist count, linking to /wishlist.
export function WishlistLink() {
  const { count } = useWishlist();
  return (
    <Link href={ROUTES.wishlist} className="relative inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-fg hover:bg-surface-muted">
      <span className="relative">
        <Heart size={20} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-deal px-1 text-[11px] font-bold leading-none text-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Wishlist</span>
      <span className="sr-only">({count} items)</span>
    </Link>
  );
}
