import type { ReactNode } from "react";

export type BadgeTone = "accent" | "deal" | "warning" | "neutral";

const TONES: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent",
  deal: "bg-deal text-white",
  warning: "bg-warning text-white",
  neutral: "bg-surface-muted text-fg-muted",
};

// Small status label, e.g. "Best Seller" or "-20%" (C2).
export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TONES[tone]} ${className ?? ""}`}>
      {children}
    </span>
  );
}
