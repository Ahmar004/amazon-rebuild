import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-border-strong bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg hover:bg-surface-muted",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type ButtonStyle = { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string };

// Shared button styling (C2), also used on <Link>s that look like buttons.
export function buttonClass({ variant = "primary", size = "md", full = false, className }: ButtonStyle = {}): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    VARIANTS[variant],
    SIZES[size],
    full ? "w-full" : "",
    className ?? "",
  ].join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle;

export function Button({ variant, size, full, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, full, className })} {...props} />;
}
