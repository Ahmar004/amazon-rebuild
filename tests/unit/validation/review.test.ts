import { describe, expect, it } from "vitest";
import { reviewAuthorName, reviewInputSchema } from "@/lib/validation/review";

describe("reviewInputSchema", () => {
  const valid = { asin: "B000TEST01", rating: 4, title: "Solid kettle", body: "Boils fast and pours cleanly." };

  it("accepts a complete review and trims text", () => {
    const parsed = reviewInputSchema.parse({ ...valid, title: "  Solid kettle  " });
    expect(parsed.title).toBe("Solid kettle");
    expect(parsed.rating).toBe(4);
  });

  it("rejects ratings outside 1 to 5 and non-integers", () => {
    expect(reviewInputSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...valid, rating: 3.5 }).success).toBe(false);
  });

  it("requires a headline and a body of at least 10 characters", () => {
    expect(reviewInputSchema.safeParse({ ...valid, title: "   " }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...valid, body: "short" }).success).toBe(false);
  });

  it("caps the headline and body length", () => {
    expect(reviewInputSchema.safeParse({ ...valid, title: "x".repeat(121) }).success).toBe(false);
    expect(reviewInputSchema.safeParse({ ...valid, body: "x".repeat(5001) }).success).toBe(false);
  });
});

describe("reviewAuthorName", () => {
  it("shows the first name and last initial", () => {
    expect(reviewAuthorName("Robin Tester")).toBe("Robin T.");
    expect(reviewAuthorName("  ada  byron lovelace ")).toBe("Ada L.");
  });

  it("shows a single name as is, capitalised", () => {
    expect(reviewAuthorName("cher")).toBe("Cher");
  });
});
