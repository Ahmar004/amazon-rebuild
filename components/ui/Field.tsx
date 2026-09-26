import type { ReactNode } from "react";

// The look of a native select or textarea, matching Input (C2).
export const fieldClass =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger";

// A label and error message around any control that Input doesn't cover (select, textarea).
export function Field({ label, id, error, hint, className, children }: { label: string; id: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-fg">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
