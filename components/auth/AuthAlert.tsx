// The red-bordered "There was a problem" box (wrong password, duplicate email, or the identify
// step's inline error) shown above the fields (docs/superpowers/plans/2026-09-19-slice-6-auth.md:
// "the red-bordered alert box 'There was a problem' / 'Your password is incorrect'").
import type { ReactNode } from "react";

type AuthAlertProps = {
  title?: string;
  message: ReactNode;
};

export function AuthAlert({ title = "There was a problem", message }: AuthAlertProps) {
  return (
    <div role="alert" className="mb-3 rounded-[3px] border border-error bg-[#fdf4f2] p-2.5">
      <p className="flex items-center gap-1.5 text-sm font-bold text-text">
        <AlertIcon />
        {title}
      </p>
      <p className="ml-[19px] text-sm text-text">{message}</p>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-error">
      <path d="M8 1 L15 14 H1 Z" fill="currentColor" />
      <rect x="7.25" y="5.5" width="1.5" height="4" fill="white" />
      <rect x="7.25" y="10.2" width="1.5" height="1.5" fill="white" />
    </svg>
  );
}
