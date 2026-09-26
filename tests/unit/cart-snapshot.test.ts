import { describe, expect, it } from "vitest";
import { withAddedCount, withQuantity, type CartSnapshot } from "@/lib/cart/snapshot";
import type { CartLine } from "@/lib/data/cart";

const line = (asin: string, quantity: number) => ({ asin, quantity, lineTotalCents: 1000 * quantity }) as CartLine;
const cart: CartSnapshot = {
  lines: [line("A", 2), line("B", 1)],
  subtotalCents: 3000,
  itemCount: 3,
  freeShipping: { thresholdCents: 3500, remainingCents: 500, percent: 85, qualified: false },
};

describe("withQuantity", () => {
  it("changes one line and the item count, leaving money alone", () => {
    const next = withQuantity(cart, "A", 5);
    expect(next.lines[0].quantity).toBe(5);
    expect(next.itemCount).toBe(6);
    expect(next.subtotalCents).toBe(3000);
  });

  it("drops the line at zero", () => {
    const next = withQuantity(cart, "B", 0);
    expect(next.lines.map((l) => l.asin)).toEqual(["A"]);
    expect(next.itemCount).toBe(2);
  });

  it("ignores an unknown product", () => {
    expect(withQuantity(cart, "Z", 3)).toBe(cart);
  });
});

describe("withAddedCount", () => {
  it("bumps the item count", () => {
    expect(withAddedCount(cart, 2).itemCount).toBe(5);
  });
});
