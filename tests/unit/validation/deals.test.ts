import { describe, expect, it } from "vitest";
import { dealsUrl, parseDealsParams } from "@/lib/validation/deals";

describe("parseDealsParams", () => {
  it("reads the category and page", () => {
    expect(parseDealsParams({ category: "toys", page: "3" })).toEqual({ category: "toys", page: 1 * 3 });
  });

  it("falls back to all categories and page 1 on bad input", () => {
    expect(parseDealsParams({ category: "", page: "-2" })).toEqual({ category: undefined, page: 1 });
    expect(parseDealsParams({ page: "abc" })).toEqual({ category: undefined, page: 1 });
  });
});

describe("dealsUrl", () => {
  it("drops defaults from the URL", () => {
    expect(dealsUrl({ page: 1 })).toBe("/deals");
    expect(dealsUrl({ category: "toys", page: 1 })).toBe("/deals?category=toys");
    expect(dealsUrl({ category: "toys", page: 2 })).toBe("/deals?category=toys&page=2");
  });
});
