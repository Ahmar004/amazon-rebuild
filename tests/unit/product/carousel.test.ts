import { describe, expect, it } from "vitest";
import { splitRelatedCarousels } from "@/lib/data/products";
import type { ProductSummary } from "@/lib/data/products";

function item(asin: string, priceCents: number, ratingCount: number): ProductSummary {
  return {
    asin,
    title: `Product ${asin}`,
    brand: "Brand",
    departmentSlug: "electronics",
    imageUrl: "https://images.example.com/I/example.jpg",
    priceCents,
    listPriceCents: null,
    ratingAvg: 4.5,
    ratingCount,
    stock: 20,
    isBestSeller: false,
  };
}

describe("splitRelatedCarousels", () => {
  it("puts the first 20 items (already sorted by rating count) into alsoViewed", () => {
    const items = Array.from({ length: 40 }, (_, i) => item(`A${i}`, 1000, 40 - i));
    const { alsoViewed } = splitRelatedCarousels(items, 1000);
    expect(alsoViewed).toHaveLength(20);
    expect(alsoViewed.map((p) => p.asin)).toEqual(items.slice(0, 20).map((p) => p.asin));
  });

  it("uses items 20-39 as related, in the same order, when there are enough", () => {
    const items = Array.from({ length: 40 }, (_, i) => item(`A${i}`, 1000, 40 - i));
    const { related } = splitRelatedCarousels(items, 1000);
    expect(related).toHaveLength(20);
    expect(related.map((p) => p.asin)).toEqual(items.slice(20, 40).map((p) => p.asin));
  });

  it("falls back to sorting the leftover items by price proximity when there are fewer than 20", () => {
    // 25 items total: alsoViewed takes 20, leaving only 5 for "related".
    const items = [
      ...Array.from({ length: 20 }, (_, i) => item(`filler${i}`, 1000, 25 - i)),
      item("cheap", 500, 5),
      item("far", 5000, 4),
      item("close", 1100, 3),
      item("closest", 1050, 2),
      item("mid", 2000, 1),
    ];
    const { alsoViewed, related } = splitRelatedCarousels(items, 1000);
    expect(alsoViewed).toHaveLength(20);
    expect(related.map((p) => p.asin)).toEqual(["closest", "close", "cheap", "mid", "far"]);
  });

  it("handles fewer than 20 items total without throwing", () => {
    const items = [item("only", 1000, 5)];
    const result = splitRelatedCarousels(items, 1000);
    expect(result.alsoViewed).toHaveLength(1);
    expect(result.related).toHaveLength(0);
  });
});
