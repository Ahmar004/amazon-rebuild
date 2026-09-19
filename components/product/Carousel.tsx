"use client";

import { useEffect, useRef, useState } from "react";
import { ProductTile, TILE_WIDTH } from "@/components/product/ProductTile";
import type { ProductSummary } from "@/lib/data/products";

type CarouselProps = {
  title: string;
  items: ProductSummary[];
};

const TILE_GAP = 16;
const STEP = TILE_WIDTH + TILE_GAP;
const DEFAULT_PER_PAGE = 5;

// A horizontal row of ProductTile with circular prev/next arrows and "Page x of y"
// (docs/spec.md 5.5). Paging slides by one visible page, measured from the track's own width via
// a ResizeObserver (not read from the ref during render - refs are for effects/handlers only) so
// it adapts to the column width at any breakpoint rather than a hardcoded tile count.
export function Carousel({ title, items }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function update() {
      if (!el) return;
      setPerPage(Math.max(1, Math.floor(el.clientWidth / STEP)));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const currentPage = Math.min(page, totalPages - 1);

  function goTo(next: number) {
    const clamped = Math.max(0, Math.min(totalPages - 1, next));
    setPage(clamped);
    trackRef.current?.scrollTo({ left: clamped * perPage * STEP, behavior: "smooth" });
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">{title}</h2>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <ArrowButton direction="prev" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 0} />
          <ArrowButton
            direction="next"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          />
        </div>
      </div>
      <div ref={trackRef} className="scrollbar-hide mt-3 flex gap-4 overflow-x-auto scroll-smooth">
        {items.map((item) => (
          <ProductTile key={item.asin} item={item} />
        ))}
      </div>
    </section>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white hover:bg-search-dept disabled:opacity-40"
    >
      <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
        <path
          d={direction === "prev" ? "M7 1 L1 6 L7 11" : "M1 1 L7 6 L1 11"}
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </button>
  );
}
