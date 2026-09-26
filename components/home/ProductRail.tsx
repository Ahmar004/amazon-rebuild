"use client";

import Link from "next/link";
import { Children, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductRailProps = {
  title: string;
  /** Optional line under the title. */
  subtitle?: string;
  /** "See all" destination. */
  href?: string;
  /** Server-rendered cards; the rail only handles scrolling. */
  children: ReactNode;
};

// A horizontal, scroll-snapping row of product cards (frontend-rebuild.md C6). Touch and trackpad
// scroll natively; on larger screens round buttons page it by one visible width.
export function ProductRail({ title, subtitle, href, children }: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }

  function page(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (Children.count(children) === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-fg sm:text-xl">{title}</h2>
          {subtitle && <p className="text-sm text-fg-muted">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link href={href} className="text-sm font-semibold text-accent hover:text-accent-hover hover:underline">
              See all
            </Link>
          )}
          <RailButton label={`Scroll ${title} back`} disabled={edges.start} onClick={() => page(-1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </RailButton>
          <RailButton label={`Scroll ${title} forward`} disabled={edges.end} onClick={() => page(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </RailButton>
        </div>
      </div>
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="scrollbar-hide -mx-1 mt-4 grid snap-x snap-mandatory auto-cols-[168px] grid-flow-col gap-3 overflow-x-auto px-1 pb-2 pt-1 sm:auto-cols-[200px] sm:gap-4"
      >
        {Children.map(children, (child) => (
          <div className="snap-start">{child}</div>
        ))}
      </div>
    </section>
  );
}

function RailButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-fg transition hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-35 sm:flex"
    >
      {children}
    </button>
  );
}
