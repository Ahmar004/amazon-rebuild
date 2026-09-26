"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addToCart, deleteItem, fetchCart, moveToCart, saveForLater, updateQuantity, type CartActionResult } from "@/actions/cart";
import { withAddedCount, withQuantity, type CartSnapshot } from "@/lib/cart/snapshot";

const GENERIC_ERROR = "Could not update your cart. Please try again.";

export type CartState = {
  /** null until the first load finishes. */
  cart: CartSnapshot | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (asin: string, quantity: number) => Promise<CartActionResult>;
  setQuantity: (asin: string, quantity: number) => Promise<CartActionResult>;
  saveForLater: (asin: string) => Promise<CartActionResult>;
  moveToCart: (asin: string) => Promise<CartActionResult>;
  /** Re-reads the cart, e.g. after checkout emptied it. */
  refresh: () => Promise<void>;
};

// The shopper's cart for the drawer and header count, loaded once per page load. Every change
// shows instantly (C20) and is then replaced by the cart the server returns, or rolled back to the
// last confirmed cart if the server refuses. Money always comes from the server.
export function useCartState(): CartState {
  const [cart, setCart] = useState<CartSnapshot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const confirmed = useRef<CartSnapshot | null>(null);

  const accept = useCallback((next: CartSnapshot) => {
    confirmed.current = next;
    setCart(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      accept(await fetchCart());
    } catch {
      // Keep whatever the drawer already shows; the next action retries.
    }
  }, [accept]);

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((next) => {
        if (!cancelled) accept(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accept]);

  const run = useCallback(
    async (optimistic: ((c: CartSnapshot) => CartSnapshot) | null, call: () => Promise<CartActionResult>) => {
      const before = confirmed.current;
      if (before && optimistic) setCart(optimistic(before));
      try {
        const result = await call();
        if (result.ok) accept(result.cart);
        else setCart(before);
        return result;
      } catch {
        setCart(before);
        return { ok: false, error: GENERIC_ERROR } as const;
      }
    },
    [accept],
  );

  return {
    cart,
    drawerOpen,
    setDrawerOpen,
    add: useCallback((asin, quantity) => run((c) => withAddedCount(c, quantity), () => addToCart({ asin, quantity })), [run]),
    setQuantity: useCallback(
      (asin, quantity) =>
        run((c) => withQuantity(c, asin, quantity), () => (quantity <= 0 ? deleteItem(asin) : updateQuantity(asin, quantity))),
      [run],
    ),
    saveForLater: useCallback((asin) => run((c) => withQuantity(c, asin, 0), () => saveForLater(asin)), [run]),
    moveToCart: useCallback((asin) => run(null, () => moveToCart(asin)), [run]),
    refresh,
  };
}
