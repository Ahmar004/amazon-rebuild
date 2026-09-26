import { describe, expect, it } from "vitest";
import { gateDecision } from "@/lib/auth/gate";

describe("gateDecision", () => {
  it("lets a signed-in visitor through", () => {
    expect(gateDecision("/search", "?k=a", true)).toEqual({ type: "allow" });
  });

  it("lets anyone open the sign-in and register pages", () => {
    expect(gateDecision("/signin", "", false)).toEqual({ type: "allow" });
    expect(gateDecision("/register", "?return_to=%2Fcart", false)).toEqual({ type: "allow" });
  });

  it("sends a signed-out visitor to sign in, remembering where they were going", () => {
    expect(gateDecision("/product/B01", "?x=1", false)).toEqual({ type: "redirect", to: "/signin?return_to=%2Fproduct%2FB01%3Fx%3D1" });
  });

  it("sends a signed-out visitor on the home page to plain /signin", () => {
    expect(gateDecision("/", "", false)).toEqual({ type: "redirect", to: "/signin" });
  });

  it("answers signed-out API calls with 401 instead of a redirect", () => {
    expect(gateDecision("/api/suggest", "?q=a", false)).toEqual({ type: "unauthorized" });
  });

  it("does not treat a path that merely starts with a public path as public", () => {
    expect(gateDecision("/signin-help", "", false)).toEqual({ type: "redirect", to: "/signin?return_to=%2Fsignin-help" });
  });
});
