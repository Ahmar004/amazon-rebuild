import { describe, expect, it } from "vitest";
import { FAST_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS, shippingCents } from "@/lib/pricing/shipping";

describe("shippingCents", () => {
  it("charges the standard fee below the free-shipping threshold", () => {
    expect(shippingCents(3499, "standard")).toBe(STANDARD_FEE_CENTS);
  });

  it("is free at the threshold", () => {
    expect(shippingCents(FREE_SHIPPING_THRESHOLD_CENTS, "standard")).toBe(0);
  });

  it("is free above the threshold", () => {
    expect(shippingCents(10000, "standard")).toBe(0);
  });

  it("charges the fast fee regardless of amount", () => {
    expect(shippingCents(0, "fast")).toBe(FAST_FEE_CENTS);
    expect(shippingCents(100000, "fast")).toBe(FAST_FEE_CENTS);
  });
});
