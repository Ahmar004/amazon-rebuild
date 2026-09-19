import { describe, expect, it } from "vitest";
import { capQuantity, mergeQuantities, MAX_CART_QUANTITY } from "@/lib/data/cart";

describe("capQuantity", () => {
  it("keeps a quantity under both the stock and the max", () => {
    expect(capQuantity(5, 20)).toBe(5);
  });

  it("caps at stock when stock is the tighter limit", () => {
    expect(capQuantity(10, 3)).toBe(3);
  });

  it("caps at MAX_CART_QUANTITY when stock is plentiful", () => {
    expect(capQuantity(50, 1000)).toBe(MAX_CART_QUANTITY);
  });

  it("floors a non-positive request at zero", () => {
    expect(capQuantity(-5, 10)).toBe(0);
  });

  it("floors at zero when the product is out of stock", () => {
    expect(capQuantity(5, 0)).toBe(0);
  });
});

describe("mergeQuantities", () => {
  it("adds the two quantities when within the cap", () => {
    expect(mergeQuantities(2, 3, 20)).toBe(5);
  });

  it("caps the sum at stock", () => {
    expect(mergeQuantities(8, 5, 10)).toBe(10);
  });

  it("caps the sum at MAX_CART_QUANTITY even with abundant stock", () => {
    expect(mergeQuantities(20, 20, 1000)).toBe(MAX_CART_QUANTITY);
  });

  it("returns zero when the product has no stock", () => {
    expect(mergeQuantities(2, 3, 0)).toBe(0);
  });
});
