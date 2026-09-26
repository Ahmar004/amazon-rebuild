import { describe, expect, it } from "vitest";
import { addToCartInputSchema, updateQuantityInputSchema } from "@/lib/validation/cart";

describe("addToCartInputSchema", () => {
  it("accepts a well-formed add-to-cart input", () => {
    const result = addToCartInputSchema.safeParse({ asin: "B000TEST01", quantity: 2 });
    expect(result.success).toBe(true);
  });

  it("rejects a missing asin", () => {
    expect(addToCartInputSchema.safeParse({ asin: "", quantity: 1 }).success).toBe(false);
  });

  it("rejects quantity below 1", () => {
    expect(addToCartInputSchema.safeParse({ asin: "B000TEST01", quantity: 0 }).success).toBe(
      false,
    );
  });

  it("rejects quantity above the cap", () => {
    expect(addToCartInputSchema.safeParse({ asin: "B000TEST01", quantity: 31 }).success).toBe(
      false,
    );
  });

  it("rejects a non-fractional quantity", () => {
    expect(addToCartInputSchema.safeParse({ asin: "B000TEST01", quantity: 1.5 }).success).toBe(
      false,
    );
  });

});

describe("updateQuantityInputSchema", () => {
  it("accepts 0 as a valid quantity (deletes the line)", () => {
    expect(updateQuantityInputSchema.safeParse({ asin: "B000TEST01", quantity: 0 }).success).toBe(true);
  });

  it("rejects a negative quantity", () => {
    expect(updateQuantityInputSchema.safeParse({ asin: "B000TEST01", quantity: -1 }).success).toBe(false);
  });

  it("rejects quantity above the cap", () => {
    expect(updateQuantityInputSchema.safeParse({ asin: "B000TEST01", quantity: 31 }).success).toBe(false);
  });
});
