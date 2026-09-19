import { describe, expect, it } from "vitest";
import { verifyPaymentForOrder } from "@/lib/checkout/verify-payment";

const BASE_PI = {
  status: "succeeded",
  amount: 5000,
  metadata: { userId: "user-1", addressId: "addr-1", speed: "standard", buy: "" },
};
const EXPECTED = { userId: "user-1", totalCents: 5000 };

describe("verifyPaymentForOrder", () => {
  it("succeeds when status, user and amount all match", () => {
    expect(verifyPaymentForOrder(BASE_PI, EXPECTED)).toEqual({ ok: true });
  });

  it("fails when the PaymentIntent has not succeeded", () => {
    const pi = { ...BASE_PI, status: "requires_action" };
    const result = verifyPaymentForOrder(pi, EXPECTED);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/status/i);
  });

  it("fails when the PaymentIntent belongs to a different user", () => {
    const pi = { ...BASE_PI, metadata: { ...BASE_PI.metadata, userId: "user-2" } };
    const result = verifyPaymentForOrder(pi, EXPECTED);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/user/i);
  });

  it("fails when the amount does not match the freshly recomputed total", () => {
    const result = verifyPaymentForOrder(BASE_PI, { ...EXPECTED, totalCents: 4999 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/amount/i);
  });
});
