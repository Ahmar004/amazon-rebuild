import type { ButtonHTMLAttributes } from "react";

// The yellow full-width "Continue" / "Sign in" button shared by every /ap form.
export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={`mt-2 flex h-8 w-full items-center justify-center rounded-lg border border-btn-yellow-border bg-btn-yellow text-sm hover:bg-btn-yellow-hover disabled:opacity-60 ${className ?? ""}`}
      {...props}
    />
  );
}
