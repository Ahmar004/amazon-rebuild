"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import type { SearchQuery } from "@/lib/validation/search";
import type { Department } from "@/lib/data/departments";

type MobileFiltersProps = {
  query: SearchQuery;
  brandFacets: { name: string; count: number }[];
  departments: Department[];
  total: number;
  activeCount: number;
};

// Below 768px the filters live in a bottom sheet (frontend-rebuild.md C7). Each filter is a link,
// so the results update behind the sheet while it stays open; "Show N results" closes it.
export function MobileFilters({ query, brandFacets, departments, total, activeCount }: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="rounded-full md:hidden">
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        side="bottom"
        footer={
          <Button full onClick={() => setOpen(false)}>
            Show {total.toLocaleString("en-US")} results
          </Button>
        }
      >
        <div className="px-4 py-3">
          <FilterSidebar query={query} brandFacets={brandFacets} departments={departments} />
        </div>
      </Sheet>
    </>
  );
}
