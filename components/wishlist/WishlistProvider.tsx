"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWishlistState, type WishlistState } from "@/hooks/useWishlistState";

const WishlistContext = createContext<WishlistState>({
  has: () => false,
  toggle: async () => ({ ok: false, wishlisted: false }),
  count: 0,
  ready: false,
});

// Shares one wishlist state between every heart on the page and the header count.
export function WishlistProvider({ children }: { children: ReactNode }) {
  return <WishlistContext.Provider value={useWishlistState()}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistState {
  return useContext(WishlistContext);
}
