"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { useToast } from "@/components/ui/Toast";

type WishlistHeartProps = {
  asin: string;
  /** "icon": round button over a product photo. "labeled": full-width button in the purchase panel. */
  variant?: "icon" | "labeled";
};

// The heart toggle on every product card and on the product page (frontend-rebuild.md C14). It
// flips instantly and rolls back with an error toast if the server refuses.
export function WishlistHeart({ asin, variant = "icon" }: WishlistHeartProps) {
  const { has, toggle, ready } = useWishlist();
  const toast = useToast();
  const on = has(asin);

  async function handleClick() {
    const result = await toggle(asin);
    if (!result.ok) toast(result.error ?? "Could not update your wishlist.", "error");
    else toast(result.wishlisted ? "Added to your wishlist" : "Removed from your wishlist");
  }

  const heart = (
    <Heart size={18} aria-hidden="true" className={`transition-transform duration-200 ${on ? "scale-110 fill-deal text-deal" : ""}`} />
  );

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready}
        aria-pressed={on}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border-strong bg-surface text-sm font-semibold text-fg transition hover:bg-surface-muted disabled:opacity-60"
      >
        {heart}
        {on ? "In your wishlist" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-fg shadow-card backdrop-blur-sm transition hover:scale-110 hover:text-deal disabled:opacity-60"
    >
      {heart}
    </button>
  );
}
