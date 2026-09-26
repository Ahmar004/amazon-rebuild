import type { ReactNode } from "react";
import { Check } from "lucide-react";

type StepCardProps = {
  step: number;
  title: string;
  description?: string;
  /** Shows a tick instead of the step number once this part is filled in. */
  done?: boolean;
  /** Prefix for the heading id, unique per page ("checkout-step", "listing-step"). */
  idPrefix: string;
  children: ReactNode;
};

// One numbered card of a form that shows every part at once (checkout, selling).
export function StepCard({ step, title, description, done = false, idPrefix, children }: StepCardProps) {
  const headingId = `${idPrefix}-${step}`;
  return (
    <section aria-labelledby={headingId} className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <h2 id={headingId} className="flex items-center gap-3 text-lg font-bold text-fg">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${done ? "bg-success text-white" : "bg-accent-soft text-accent"}`}
          aria-hidden="true"
        >
          {done ? <Check size={16} /> : step}
        </span>
        {title}
      </h2>
      {description && <p className="ml-10 text-sm text-fg-muted">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}
