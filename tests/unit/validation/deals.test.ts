import { describe, expect, it } from "vitest";
import { dealsUrl, parseDealsParams } from "@/lib/validation/deals";

describe("parseDealsParams", () => {
  it("reads the department and page", () => {
    expect(parseDealsParams({ dept: "toys", page: "3" })).toEqual({ dept: "toys", page: 1 * 3 });
  });

  it("falls back to all departments and page 1 on bad input", () => {
    expect(parseDealsParams({ dept: "", page: "-2" })).toEqual({ dept: undefined, page: 1 });
    expect(parseDealsParams({ page: "abc" })).toEqual({ dept: undefined, page: 1 });
  });
});

describe("dealsUrl", () => {
  it("drops defaults from the URL", () => {
    expect(dealsUrl({ page: 1 })).toBe("/deals");
    expect(dealsUrl({ dept: "toys", page: 1 })).toBe("/deals?dept=toys");
    expect(dealsUrl({ dept: "toys", page: 2 })).toBe("/deals?dept=toys&page=2");
  });
});
