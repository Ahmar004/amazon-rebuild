import { describe, expect, it } from "vitest";
import { parseSearchParams, toSearchUrl } from "@/lib/validation/search";

describe("parseSearchParams", () => {
  it("parses a full set of params", () => {
    const q = parseSearchParams({
      k: "headphones",
      i: "electronics",
      rating: "4",
      brand: ["Sony", "Bose"],
      pmin: "10",
      pmax: "100",
      deals: "1",
      sort: "price-asc",
      page: "2",
    });
    expect(q).toEqual({
      k: "headphones",
      dept: "electronics",
      minRating: 4,
      brands: ["Sony", "Bose"],
      pminCents: 1000,
      pmaxCents: 10000,
      dealsOnly: true,
      sort: "price-asc",
      page: 2,
    });
  });

  it("defaults missing values", () => {
    const q = parseSearchParams({});
    expect(q).toEqual({
      k: undefined,
      dept: undefined,
      minRating: undefined,
      brands: [],
      pminCents: undefined,
      pmaxCents: undefined,
      dealsOnly: false,
      sort: "featured",
      page: 1,
    });
  });

  it("falls back to defaults for invalid values instead of throwing", () => {
    const q = parseSearchParams({
      rating: "9",
      sort: "not-a-sort",
      page: "-5",
      pmin: "abc",
    });
    expect(q.minRating).toBeUndefined();
    expect(q.sort).toBe("featured");
    expect(q.page).toBe(1);
    expect(q.pminCents).toBeUndefined();
  });

  it("accepts a single brand as a string", () => {
    const q = parseSearchParams({ brand: "Sony" });
    expect(q.brands).toEqual(["Sony"]);
  });
});

describe("toSearchUrl", () => {
  it("rebuilds the url with a patch and resets the page", () => {
    const base = parseSearchParams({ k: "headphones", page: "3" });
    const url = toSearchUrl(base, { sort: "price-asc" });
    expect(url).toBe("/s?k=headphones&sort=price-asc");
  });

  it("keeps existing filters and adds a brand", () => {
    const base = parseSearchParams({ k: "headphones", brand: "Sony" });
    const url = toSearchUrl(base, { brands: ["Sony", "Bose"] });
    expect(url).toContain("k=headphones");
    expect(url).toContain("brand=Sony");
    expect(url).toContain("brand=Bose");
  });

  it("omits default sort and page from the url", () => {
    const base = parseSearchParams({ k: "headphones" });
    const url = toSearchUrl(base, {});
    expect(url).toBe("/s?k=headphones");
  });
});
