import { describe, expect, it } from "vitest";
import { parseBuyParam } from "@/lib/checkout/source";

describe("parseBuyParam", () => {
  it("parses a well-formed asin:qty pair", () => {
    expect(parseBuyParam("B000TEST01:2")).toEqual({ asin: "B000TEST01", quantity: 2 });
  });

  it("returns null for a missing value", () => {
    expect(parseBuyParam(undefined)).toBeNull();
    expect(parseBuyParam(null)).toBeNull();
    expect(parseBuyParam("")).toBeNull();
  });

  it("returns null when there is no separator", () => {
    expect(parseBuyParam("B000TEST01")).toBeNull();
  });

  it("returns null for a zero or negative quantity", () => {
    expect(parseBuyParam("B000TEST01:0")).toBeNull();
    expect(parseBuyParam("B000TEST01:-1")).toBeNull();
  });

  it("returns null for a non-integer quantity", () => {
    expect(parseBuyParam("B000TEST01:1.5")).toBeNull();
    expect(parseBuyParam("B000TEST01:abc")).toBeNull();
  });
});
