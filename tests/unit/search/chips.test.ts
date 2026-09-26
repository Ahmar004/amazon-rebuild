import { describe, expect, it } from "vitest";
import { appliedFilterChips, clearFiltersUrl, priceRangeLabel } from "@/lib/search/chips";
import type { SearchQuery } from "@/lib/validation/search";

const base: SearchQuery = { k: "lamp", brands: [], dealsOnly: false, sort: "featured", page: 3 };

describe("priceRangeLabel", () => {
  it("labels open and closed ranges", () => {
    expect(priceRangeLabel(undefined, 2500)).toBe("Up to $25");
    expect(priceRangeLabel(20000, undefined)).toBe("$200 & above");
    expect(priceRangeLabel(2550, 5000)).toBe("$25.50 - $50");
    expect(priceRangeLabel(undefined, undefined)).toBeNull();
  });
});

describe("appliedFilterChips", () => {
  it("returns no chips when only a keyword is set", () => {
    expect(appliedFilterChips(base, null)).toEqual([]);
  });

  it("builds one chip per filter, each removing only itself and resetting the page", () => {
    const q: SearchQuery = { ...base, category: "electronics", minRating: 4, brands: ["Anker", "Sony"], pminCents: 2500, pmaxCents: 5000, dealsOnly: true };
    const chips = appliedFilterChips(q, "Electronics");
    expect(chips.map((c) => c.label)).toEqual(["Electronics", "4 stars & up", "Anker", "Sony", "$25 - $50", "Deals only"]);
    const anker = chips.find((c) => c.label === "Anker")!;
    expect(anker.href).toContain("brand=Sony");
    expect(anker.href).not.toContain("Anker");
    expect(anker.href).not.toContain("page=");
    const category = chips.find((c) => c.label === "Electronics")!;
    expect(category.href).not.toContain("i=electronics");
  });

  it("falls back to the slug when the category name is unknown", () => {
    expect(appliedFilterChips({ ...base, category: "toys" }, null)[0].label).toBe("toys");
  });
});

describe("clearFiltersUrl", () => {
  it("keeps the keyword and sort but drops every filter", () => {
    const url = clearFiltersUrl({ ...base, sort: "price-asc", minRating: 3, brands: ["X"], dealsOnly: true });
    expect(url).toBe("/search?k=lamp&sort=price-asc");
  });
});
