// Demo-store notice, shown in the footer and the checkout box. Orders, stock and sales are real
// database records and only the card is a test card, so it no longer says no orders are placed (D1).
export const DEMO_NOTICE = "Shopeedo is a demo store built for an 8x assessment. Payments run in Stripe test mode.";

export function SafetyNotice({ className }: { className?: string }) {
  return <p className={`text-xs text-fg-muted ${className ?? ""}`}>{DEMO_NOTICE}</p>;
}
