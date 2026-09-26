import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: { label: string; href: string };
};

// The styled "nothing here yet" panel (C20) with an optional next step.
export function EmptyState({ icon: Icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center animate-[fade-in_250ms_ease-out]">
      <Icon size={40} className="text-fg-muted" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-fg">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{children}</p>
      {action && (
        <Link href={action.href} className={buttonClass({ className: "mt-5 rounded-full" })}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
