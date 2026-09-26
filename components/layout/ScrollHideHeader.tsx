"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { ROUTES } from "@/lib/constants/links";

// Wraps the header so it can hide on scroll-down and reappear on scroll-up, but only on the
// search results page (docs/design.md 6.1, 6.3). Header/SubNav/HeaderMobile stay server
// components; this client wrapper only toggles a transform class around them.
export function ScrollHideHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hidden = useScrollDirection();
  const active = pathname === ROUTES.search;

  return (
    <div
      className={
        active
          ? `sticky top-0 z-20 bg-surface transition-transform duration-200 ${hidden ? "-translate-y-full" : "translate-y-0"}`
          : undefined
      }
    >
      {children}
    </div>
  );
}
