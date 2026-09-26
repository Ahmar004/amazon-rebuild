import type { ButtonHTMLAttributes } from "react";

// The yellow full-width "Continue" / "Sign in" button shared by every /ap form.
export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={`mt-2 flex h-8 w-full items-center justify-center rounded-lg border border-accent bg-accent text-accent-fg text-sm hover:bg-accent-hover disabled:opacity-60 ${className ?? ""}`}
      {...props}
    />
  );
}
