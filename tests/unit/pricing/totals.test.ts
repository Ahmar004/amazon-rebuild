import { describe, expect, it } from "vitest";
import { computeTotals } from "@/lib/pricing/totals";

describe("computeTotals", () => {
  it("adds items, shipping and tax into the total", () => {
    const totals = computeTotals({
      lines: [
        { unitPriceCents: 1000, quantity: 2 },
        { unitPriceCents: 500, quantity: 1 },
      ],
      speed: "standard",
      state: "CA",
    });

    expect(totals.itemsCents).toBe(2500);
    expect(totals.shippingCents).toBe(699); // below the $35 free-shipping threshold
    expect(totals.beforeTaxCents).toBe(2500 + 699);
    expect(totals.taxCents).toBe(Math.round(2500 * 0.0725));
    expect(totals.totalCents).toBe(totals.beforeTaxCents + totals.taxCents);
  });

  it("gives free standard shipping at or above the threshold", () => {
    const totals = computeTotals({
      lines: [{ unitPriceCents: 3500, quantity: 1 }],
      speed: "standard",
      state: "OR",
    });
    expect(totals.shippingCents).toBe(0);
    expect(totals.taxCents).toBe(0);
    expect(totals.totalCents).toBe(3500);
  });

  it("charges the fast fee regardless of subtotal", () => {
    const totals = computeTotals({
      lines: [{ unitPriceCents: 10000, quantity: 1 }],
      speed: "fast",
      state: "OR",
    });
    expect(totals.shippingCents).toBe(999);
  });

  it("has zero items and tax for an empty line list (checkout redirects before this happens)", () => {
    const totals = computeTotals({ lines: [], speed: "standard", state: "OR" });
    expect(totals.itemsCents).toBe(0);
    expect(totals.taxCents).toBe(0);
  });
});
