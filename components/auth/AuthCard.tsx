import Link from "next/link";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/constants/links";

type AuthCardProps = {
  mode: "signin" | "register";
  returnTo: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

// The sign-in / create-account card with a two-way switch at the top (C11). The switch keeps
// return_to so the shopper still lands where they were headed.
export function AuthCard({ mode, returnTo, title, subtitle, children }: AuthCardProps) {
  const qs = returnTo === "/" ? "" : `?return_to=${encodeURIComponent(returnTo)}`;
  const tabs = [
    { key: "signin", label: "Sign in", href: `${ROUTES.signIn}${qs}` },
    { key: "register", label: "Create account", href: `${ROUTES.register}${qs}` },
  ] as const;

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
      <nav aria-label="Account" className="grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={tab.key === mode ? "page" : undefined}
            className={`rounded-md py-2 text-center text-sm font-semibold transition-colors ${
              tab.key === mode ? "bg-surface text-fg shadow-card" : "text-fg-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <h1 className="mt-6 text-2xl font-bold text-fg">{title}</h1>
      <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function AuthCardSkeleton() {
  return <div className="h-[460px] w-full max-w-[420px] animate-pulse rounded-2xl border border-border bg-surface" aria-hidden="true" />;
}
