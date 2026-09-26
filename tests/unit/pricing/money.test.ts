import { describe, expect, it } from "vitest";
import { discountPercent, formatPrice, splitPrice } from "@/lib/pricing/money";

describe("formatPrice", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(2499)).toBe("$24.99");
  });

  it("adds a thousands separator", () => {
    expect(formatPrice(100000)).toBe("$1,000.00");
  });

  it("pads small amounts", () => {
    expect(formatPrice(5)).toBe("$0.05");
  });
});

describe("splitPrice", () => {
  it("splits whole and fraction", () => {
    expect(splitPrice(2499)).toEqual({ whole: "24", fraction: "99" });
  });

  it("keeps the thousands separator in the whole part", () => {
    expect(splitPrice(100000)).toEqual({ whole: "1,000", fraction: "00" });
  });
});

describe("discountPercent", () => {
  it("returns null when there is no list price", () => {
    expect(discountPercent(2499, null)).toBeNull();
  });

  it("returns null when the list price is not higher", () => {
    expect(discountPercent(2499, 2499)).toBeNull();
    expect(discountPercent(2499, 2000)).toBeNull();
  });

  it("returns a rounded percent", () => {
    expect(discountPercent(2499, 3499)).toBe(29);
  });
});

describe("parsePriceToCents", () => {
  it("reads dollars with up to two decimals", async () => {
    const { parsePriceToCents } = await import("@/lib/pricing/money");
    expect(parsePriceToCents("19.99")).toBe(1999);
    expect(parsePriceToCents(" 19 ")).toBe(1900);
    expect(parsePriceToCents("19.9")).toBe(1990);
    expect(parsePriceToCents("0.5")).toBe(50);
    expect(parsePriceToCents("1,250.00")).toBe(125000);
  });

  it("returns null for anything else", async () => {
    const { parsePriceToCents } = await import("@/lib/pricing/money");
    for (const bad of ["", "abc", "19.999", "-5", "1e3", "12.", ".5x"]) expect(parsePriceToCents(bad)).toBeNull();
  });
});
