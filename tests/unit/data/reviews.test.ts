import { describe, expect, it } from "vitest";
import { buildReviewConditions } from "@/lib/data/reviews";
import { sqlText } from "@/lib/data/search";

describe("buildReviewConditions", () => {
  it("always filters by asin", () => {
    const sqls = buildReviewConditions("B000TEST01").map(sqlText);
    expect(sqls.some((s) => s.includes("asin"))).toBe(true);
  });

  it("adds a rating condition when a star filter is given", () => {
    const withStar = buildReviewConditions("B000TEST01", 5).map(sqlText);
    const withoutStar = buildReviewConditions("B000TEST01").map(sqlText);
    expect(withStar.some((s) => s.includes("rating"))).toBe(true);
    expect(withoutStar.some((s) => s.includes("rating"))).toBe(false);
  });
});
