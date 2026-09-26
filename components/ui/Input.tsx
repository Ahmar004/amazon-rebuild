import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Error message shown under the field; also marks the input invalid. */
  error?: string;
  /** Optional element on the right edge of the field, e.g. a show-password button. */
  trailing?: ReactNode;
};

export const inputClass =
  "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/25 aria-invalid:border-danger";

// Labelled text field (C2). The label is always visible, and errors are tied to the input.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, trailing, id, className, ...props }, ref) {
  const inputId = id ?? props.name;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-fg">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`${inputClass} ${trailing ? "pr-11" : ""}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
