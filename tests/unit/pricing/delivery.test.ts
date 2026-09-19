import { describe, expect, it } from "vitest";
import { deliveryDate, formatDeliveryDate } from "@/lib/pricing/delivery";

describe("deliveryDate", () => {
  it("adds 5 days for standard", () => {
    const from = new Date(Date.UTC(2026, 8, 24)); // Sep 24
    const result = deliveryDate(from, "standard");
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(8);
    expect(result.getUTCDate()).toBe(29);
  });

  it("adds 2 days for fast", () => {
    const from = new Date(Date.UTC(2026, 8, 24));
    const result = deliveryDate(from, "fast");
    expect(result.getUTCDate()).toBe(26);
  });

  it("crosses a month boundary", () => {
    const from = new Date(Date.UTC(2026, 8, 29)); // Sep 29
    const result = deliveryDate(from, "standard");
    expect(result.getUTCMonth()).toBe(9); // October
    expect(result.getUTCDate()).toBe(4);
  });
});

describe("formatDeliveryDate", () => {
  it("formats as weekday, month, day", () => {
    const d = new Date(Date.UTC(2026, 8, 29));
    expect(formatDeliveryDate(d)).toBe("Tuesday, Sep 29");
  });
});
