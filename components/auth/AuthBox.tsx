import type { ReactNode } from "react";

type AuthBoxProps = {
  title: string;
  children: ReactNode;
};

// The centred, bordered box every /ap page renders its form inside (docs/superpowers/plans/
// 2026-09-19-slice-6-auth.md global constraints: "a centred bordered box about 350px wide, 8px
// radius"). Amazon's box has no drop shadow on the auth pages, just a 1px border.
export function AuthBox({ title, children }: AuthBoxProps) {
  return (
    <div className="w-full max-w-[350px] rounded-lg border border-border bg-white p-6">
      <h1 className="mb-3 text-2xl font-normal text-text">{title}</h1>
      {children}
    </div>
  );
}
