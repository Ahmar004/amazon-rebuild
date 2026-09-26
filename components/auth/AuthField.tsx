import type { InputHTMLAttributes } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  /** Keeps the label in the accessibility tree but visually hides it, for a field whose visible
   * label lives in a custom row above (PasswordForm's "Password" / "Forgot password?" row). */
  hideLabel?: boolean;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

// A labelled auth-form input: a bold small label, a bordered input with
// a blue focus ring, and an inline red error with the alert glyph directly under it
// (docs/superpowers/plans/2026-09-19-slice-6-auth.md: "Validation messages under the fields in
// red with the alert icon").
export function AuthField({ id, label, hideLabel, error, hint, className, ...inputProps }: AuthFieldProps) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-1 block text-sm font-bold text-fg"}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`h-8 w-full rounded-[3px] border px-2 text-base outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/40 ${
          error ? "border-danger" : "border-border-strong"
        } ${className ?? ""}`}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 flex items-center gap-1 text-xs text-danger">
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
      <path
        d="M8 1 L15 14 H1 Z"
        fill="currentColor"
      />
      <rect x="7.25" y="5.5" width="1.5" height="4" fill="white" />
      <rect x="7.25" y="10.2" width="1.5" height="1.5" fill="white" />
    </svg>
  );
}
