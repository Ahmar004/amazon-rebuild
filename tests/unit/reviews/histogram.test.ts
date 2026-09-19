import { describe, expect, it } from "vitest";
import { averageRating, histogramFromAverage, histogramPercents, totalRatings } from "@/lib/reviews/histogram";

describe("histogramFromAverage", () => {
  it("distributes exactly the given number of ratings", () => {
    expect(totalRatings(histogramFromAverage(4.3, 1234))).toBe(1234);
  });

  it("keeps the average within 0.05 of the dataset average", () => {
    for (const avg of [1.2, 2.5, 3.0, 3.9, 4.4, 4.8]) {
      expect(Math.abs(averageRating(histogramFromAverage(avg, 5000)) - avg)).toBeLessThan(0.05);
    }
  });

  it("puts most ratings on 5 stars for a high average and on 1 star for a low one", () => {
    const high = histogramFromAverage(4.7, 1000);
    const low = histogramFromAverage(1.4, 1000);
    expect(high[4]).toBe(Math.max(...high));
    expect(low[0]).toBe(Math.max(...low));
  });

  it("is deterministic", () => {
    expect(histogramFromAverage(4.1, 321)).toEqual(histogramFromAverage(4.1, 321));
  });

  it("returns all zeros for zero ratings", () => {
    expect(histogramFromAverage(4.5, 0)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("averageRating and histogramPercents", () => {
  it("computes the weighted average rounded to one decimal", () => {
    // counts are [1-star, 2-star, 3-star, 4-star, 5-star]
    expect(averageRating([0, 0, 0, 1, 1])).toBe(4.5);
    expect(averageRating([0, 0, 0, 0, 0])).toBe(0);
  });

  it("gives whole-number percentages per star that sum to 100", () => {
    const pct = histogramPercents([1, 0, 0, 0, 3]);
    expect(pct).toEqual({ 1: 25, 2: 0, 3: 0, 4: 0, 5: 75 });
    expect(Object.values(histogramPercents([3, 3, 3, 0, 0])).reduce((a, b) => a + b, 0)).toBe(100);
  });
});
