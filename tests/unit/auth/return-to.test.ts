import { describe, expect, it } from "vitest";
import { safeReturnTo } from "@/lib/auth/return-to";

describe("safeReturnTo", () => {
  it("keeps a plain internal path", () => {
    expect(safeReturnTo("/checkout")).toBe("/checkout");
  });

  it("keeps a path with a query string", () => {
    expect(safeReturnTo("/cart?foo=bar")).toBe("/cart?foo=bar");
  });

  it("falls back to / for a protocol-relative URL", () => {
    expect(safeReturnTo("//evil.com")).toBe("/");
  });

  it("falls back to / for a backslash-prefixed path", () => {
    expect(safeReturnTo("/\\evil.com")).toBe("/");
  });

  it("falls back to / for an absolute URL", () => {
    expect(safeReturnTo("https://x")).toBe("/");
  });

  it("falls back to / for an empty value", () => {
    expect(safeReturnTo("")).toBe("/");
  });

  it("falls back to / for undefined", () => {
    expect(safeReturnTo(undefined)).toBe("/");
  });

  it("falls back to / for a value not starting with a slash", () => {
    expect(safeReturnTo("checkout")).toBe("/");
  });

  it("falls back to / for a tab-prefixed protocol-relative bypass", () => {
    expect(safeReturnTo("/\t/evil.com")).toBe("/");
  });

  it("falls back to / for a newline-prefixed protocol-relative bypass", () => {
    expect(safeReturnTo("/\n/evil.com")).toBe("/");
  });
});
