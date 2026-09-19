import { describe, expect, it } from "vitest";
import { parseReviewsParams, reviewsUrl } from "@/lib/reviews/query";

describe("parseReviewsParams", () => {
  it("defaults to no star filter and page 1", () => {
    expect(parseReviewsParams({})).toEqual({ star: undefined, page: 1 });
  });

  it("reads a valid star filter", () => {
    expect(parseReviewsParams({ star: "5" })).toEqual({ star: 5, page: 1 });
  });

  it("ignores an out-of-range star value", () => {
    expect(parseReviewsParams({ star: "9" })).toEqual({ star: undefined, page: 1 });
  });

  it("reads the rpage param as page", () => {
    expect(parseReviewsParams({ rpage: "3" })).toEqual({ star: undefined, page: 3 });
  });

  it("falls back to page 1 for a garbage rpage", () => {
    expect(parseReviewsParams({ rpage: "abc" })).toEqual({ star: undefined, page: 1 });
  });

  it("takes the first value when given an array (repeated query param)", () => {
    expect(parseReviewsParams({ star: ["4", "5"] })).toEqual({ star: 4, page: 1 });
  });
});

describe("reviewsUrl", () => {
  it("builds a star filter link and resets the page", () => {
    expect(reviewsUrl({ star: undefined, page: 3 }, { star: 5 })).toBe("?star=5#reviews");
  });

  it("clears the filter", () => {
    expect(reviewsUrl({ star: 5, page: 2 }, { star: undefined })).toBe("#reviews");
  });

  it("builds a paging link, keeping the current star filter", () => {
    expect(reviewsUrl({ star: 4, page: 1 }, { page: 2 })).toBe("?star=4&rpage=2#reviews");
  });

  it("omits rpage for page 1", () => {
    expect(reviewsUrl({ star: undefined, page: 1 }, {})).toBe("#reviews");
  });
});
