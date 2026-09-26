"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCartState, type CartState } from "@/hooks/useCartState";
import { CartDrawer } from "@/components/cart/CartDrawer";

const NOT_READY = async () => ({ ok: false, error: "Your cart is still loading." }) as const;

const CartContext = createContext<CartState>({
  cart: null,
  drawerOpen: false,
  setDrawerOpen: () => {},
  add: NOT_READY,
  setQuantity: NOT_READY,
  saveForLater: NOT_READY,
  moveToCart: NOT_READY,
  refresh: async () => {},
});

// One cart state for the header count, the slide-in drawer and every Add to cart button (C8).
export function CartProvider({ children }: { children: ReactNode }) {
  const state = useCartState();
  return (
    <CartContext.Provider value={state}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  return useContext(CartContext);
}
