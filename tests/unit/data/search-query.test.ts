import { describe, expect, it } from "vitest";
import { buildSearchConditions, buildSearchOrderBy, sqlText } from "@/lib/data/search";
import type { SearchQuery } from "@/lib/validation/search";

const base: SearchQuery = {
  brands: [],
  dealsOnly: false,
  sort: "featured",
  page: 1,
};

describe("buildSearchConditions", () => {
  it("includes a text-search condition when k is set", () => {
    const sqls = buildSearchConditions({ ...base, k: "headphones" }).map(sqlText);
    expect(sqls.some((s) => s.includes("search_vector"))).toBe(true);
  });

  it("omits the text condition for department browse without k", () => {
    const sqls = buildSearchConditions({ ...base, dept: "electronics" }).map(sqlText);
    expect(sqls.some((s) => s.includes("search_vector"))).toBe(false);
  });

  it("adds a rating condition", () => {
    const sqls = buildSearchConditions({ ...base, minRating: 4 }).map(sqlText);
    expect(sqls.some((s) => s.includes("rating_avg"))).toBe(true);
  });

  it("adds a brand condition", () => {
    const sqls = buildSearchConditions({ ...base, brands: ["Sony"] }).map(sqlText);
    expect(sqls.some((s) => s.includes("brand"))).toBe(true);
  });

  it("adds a price range condition", () => {
    const sqls = buildSearchConditions({ ...base, pminCents: 1000, pmaxCents: 5000 }).map(sqlText);
    expect(sqls.some((s) => s.includes("price_cents"))).toBe(true);
  });

  it("adds a deals-only condition", () => {
    const sqls = buildSearchConditions({ ...base, dealsOnly: true }).map(sqlText);
    expect(sqls.some((s) => s.includes("list_price_cents"))).toBe(true);
  });

  it("ignores the brand filter when building brand facets", () => {
    const withBrand = buildSearchConditions({ ...base, brands: ["Sony"] }, { forFacets: true }).map(sqlText);
    const withoutBrand = buildSearchConditions({ ...base }, { forFacets: true }).map(sqlText);
    expect(withBrand.length).toBe(withoutBrand.length);
  });
});

describe("buildSearchOrderBy", () => {
  it("has an order clause for every sort key", () => {
    const keys = ["featured", "price-asc", "price-desc", "review", "newest", "bestsellers"] as const;
    for (const key of keys) {
      expect(buildSearchOrderBy(key)).toBeTruthy();
    }
  });

  it("orders price-asc by price ascending", () => {
    expect(sqlText(buildSearchOrderBy("price-asc"))).toMatch(/price_cents/);
  });
});
