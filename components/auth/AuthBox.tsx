import type { ReactNode } from "react";

type AuthBoxProps = {
  title: string;
  children: ReactNode;
};

// The centred, bordered box every /ap page renders its form inside (docs/superpowers/plans/
// 2026-09-19-slice-6-auth.md global constraints: "a centred bordered box about 350px wide, 8px
// radius").
export function AuthBox({ title, children }: AuthBoxProps) {
  return (
    <div className="w-full max-w-[350px] rounded-xl border border-border bg-surface p-6">
      <h1 className="mb-3 text-2xl font-normal text-fg">{title}</h1>
      {children}
    </div>
  );
}
