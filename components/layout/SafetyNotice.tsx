// Demo-store notice (decided with the user on 2026-09-26, replacing the old clone disclaimer):
// shown in the footer and the checkout box so nobody mistakes the store for a real shop.
export const DEMO_NOTICE =
  "Shopeedo is a demo store built for an 8x assessment. No real orders are placed; use Stripe test cards.";

export function SafetyNotice({ className }: { className?: string }) {
  return <p className={`text-xs text-fg-muted ${className ?? ""}`}>{DEMO_NOTICE}</p>;
}
