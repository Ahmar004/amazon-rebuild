import type { ReactNode } from "react";
import { StepCard } from "@/components/ui/StepCard";

type CheckoutSectionProps = {
  step: number;
  title: string;
  /** Shows a tick instead of the step number once the shopper has filled this section in. */
  done?: boolean;
  children: ReactNode;
};

// One numbered card on the one-page checkout (C12). All three sections stay open at once, so the
// shopper sees address, delivery speed and payment together instead of stepping through them.
export function CheckoutSection(props: CheckoutSectionProps) {
  return <StepCard idPrefix="checkout-step" {...props} />;
}

// Shared radio-card styling for addresses, delivery speeds and cards.
export function choiceClass(selected: boolean): string {
  return `flex cursor-pointer gap-3 rounded-lg border p-3 text-sm text-fg transition-colors ${
    selected ? "border-accent bg-accent-soft/60 ring-1 ring-accent" : "border-border hover:border-border-strong"
  }`;
}
