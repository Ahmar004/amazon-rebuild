import type { CartLine } from "@/lib/data/cart";
import type { FreeShippingProgress } from "@/lib/pricing/shipping";

// What the cart drawer and header count show: the current lines and the server-computed money.
export type CartSnapshot = {
  lines: CartLine[];
  subtotalCents: number;
  itemCount: number;
  freeShipping: FreeShippingProgress;
};

// Pure: the snapshot with one line's quantity changed, for an instant (optimistic) stepper. Money
// is left as the server last sent it; the real numbers replace this as soon as the action returns.
export function withQuantity(cart: CartSnapshot, asin: string, quantity: number): CartSnapshot {
  const current = cart.lines.find((line) => line.asin === asin);
  if (!current) return cart;
  const lines =
    quantity <= 0
      ? cart.lines.filter((line) => line.asin !== asin)
      : cart.lines.map((line) => (line.asin === asin ? { ...line, quantity } : line));
  return { ...cart, lines, itemCount: cart.itemCount - current.quantity + Math.max(0, quantity) };
}

// Pure: the snapshot after adding units of a product, for an instant header count on "Add to cart".
export function withAddedCount(cart: CartSnapshot, quantity: number): CartSnapshot {
  return { ...cart, itemCount: cart.itemCount + quantity };
}
