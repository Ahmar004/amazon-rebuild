import { describe, expect, it } from "vitest";
import { newOrderId } from "@/lib/pricing/order-id";

describe("newOrderId", () => {
  it("matches the order-id shape", () => {
    expect(newOrderId()).toMatch(/^\d{3}-\d{7}-\d{7}$/);
  });

  it("generates a different id each call", () => {
    expect(newOrderId()).not.toBe(newOrderId());
  });
});
