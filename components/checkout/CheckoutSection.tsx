import type { ReactNode } from "react";
import { Check } from "lucide-react";

type CheckoutSectionProps = {
  step: number;
  title: string;
  /** Shows a tick instead of the step number once the shopper has filled this section in. */
  done?: boolean;
  children: ReactNode;
};

// One numbered card on the one-page checkout (C12). All three sections stay open at once, so the
// shopper sees address, delivery speed and payment together instead of stepping through them.
export function CheckoutSection({ step, title, done = false, children }: CheckoutSectionProps) {
  return (
    <section aria-labelledby={`checkout-step-${step}`} className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <h2 id={`checkout-step-${step}`} className="flex items-center gap-3 text-lg font-bold text-fg">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
            done ? "bg-success text-white" : "bg-accent-soft text-accent"
          }`}
          aria-hidden="true"
        >
          {done ? <Check size={16} /> : step}
        </span>
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

// Shared radio-card styling for addresses, delivery speeds and cards.
export function choiceClass(selected: boolean): string {
  return `flex cursor-pointer gap-3 rounded-lg border p-3 text-sm text-fg transition-colors ${
    selected ? "border-accent bg-accent-soft/60 ring-1 ring-accent" : "border-border hover:border-border-strong"
  }`;
}
