// Pure guard extracted from finalizeOrder (docs/superpowers/plans/2026-09-19-slice-7-checkout.md
// TDD note) so the three failure modes are unit-testable without touching Stripe or the database.
// finalizeOrder (actions/checkout.ts) calls this after re-reading the PaymentIntent from Stripe.
export type MinimalPaymentIntent = {
  status: string;
  amount: number;
  metadata: { userId?: string | null } & Record<string, unknown>;
};

export type VerifyPaymentExpected = { userId: string; totalCents: number };

export type VerifyPaymentResult = { ok: true } | { ok: false; reason: string };

export function verifyPaymentForOrder(pi: MinimalPaymentIntent, expected: VerifyPaymentExpected): VerifyPaymentResult {
  if (pi.status !== "succeeded") {
    return { ok: false, reason: `PaymentIntent status is "${pi.status}", not "succeeded"` };
  }
  if (pi.metadata.userId !== expected.userId) {
    return { ok: false, reason: "PaymentIntent belongs to a different user" };
  }
  if (pi.amount !== expected.totalCents) {
    return { ok: false, reason: "PaymentIntent amount does not match the recomputed order total" };
  }
  return { ok: true };
}
