import type { HTMLAttributes } from "react";

export const cardClass = "rounded-xl border border-border bg-surface shadow-card";

// Rounded surface for grouped content (C2, point 3).
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClass} ${className ?? ""}`} {...props} />;
}
