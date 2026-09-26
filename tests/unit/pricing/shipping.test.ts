import { describe, expect, it } from "vitest";
import { FAST_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS, freeShippingProgress, shippingCents } from "@/lib/pricing/shipping";

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

describe("freeShippingProgress", () => {
  it("reports the amount still needed below the threshold", () => {
    expect(freeShippingProgress(2000)).toEqual({ thresholdCents: FREE_SHIPPING_THRESHOLD_CENTS, remainingCents: 1500, percent: 57, qualified: false });
  });

  it("qualifies at and above the threshold", () => {
    expect(freeShippingProgress(FREE_SHIPPING_THRESHOLD_CENTS)).toMatchObject({ remainingCents: 0, percent: 100, qualified: true });
    expect(freeShippingProgress(99999)).toMatchObject({ remainingCents: 0, percent: 100, qualified: true });
  });

  it("starts at zero for an empty cart", () => {
    expect(freeShippingProgress(0)).toMatchObject({ remainingCents: FREE_SHIPPING_THRESHOLD_CENTS, percent: 0, qualified: false });
  });
});
