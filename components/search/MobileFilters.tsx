"use client";

import { useRef, useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";
import type { SearchQuery } from "@/lib/validation/search";
import type { Department } from "@/lib/data/departments";

type MobileFiltersProps = {
  query: SearchQuery;
  brandFacets: { name: string; count: number }[];
  departments: Department[];
  total: number;
};

// Mobile "Filters" button that opens a full-screen sheet with the same filter groups, sort, and
// a "Show N results" apply button (docs/design.md 6.3).
export function MobileFilters({ query, brandFacets, departments, total }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useDismiss(panelRef, open, () => setOpen(false));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded border border-border bg-white px-3 py-1.5 text-sm font-bold text-text md:hidden"
      >
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            tabIndex={-1}
            className="flex h-full flex-col outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-base font-bold text-text">Filters</h2>
              <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="p-1 text-text">
                <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M1 1 L15 15 M15 1 L1 15" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="mb-4 border-b border-border pb-3">
                <h3 className="mb-1 font-bold text-text">Sort</h3>
                <SortSelect query={query} />
              </div>
              <FilterSidebar query={query} brandFacets={brandFacets} departments={departments} />
            </div>

            <div className="border-t border-border p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full border border-btn-yellow-border bg-btn-yellow py-2 text-sm font-bold text-text hover:bg-btn-yellow-hover"
              >
                Show {total.toLocaleString("en-US")} results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
