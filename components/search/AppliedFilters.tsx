import Link from "next/link";
import { X } from "lucide-react";
import { appliedFilterChips, clearFiltersUrl } from "@/lib/search/chips";
import type { SearchQuery } from "@/lib/validation/search";

// The chip bar of active filters with "Clear all" (frontend-rebuild.md C7). Hidden when no
// filter is applied.
export function AppliedFilters({ query, departmentName }: { query: SearchQuery; departmentName: string | null }) {
  const chips = appliedFilterChips(query, departmentName);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft pl-3 pr-2 text-sm font-medium text-accent transition hover:border-accent"
        >
          {chip.label}
          <X size={14} aria-hidden="true" />
        </Link>
      ))}
      <Link href={clearFiltersUrl(query)} className="px-2 text-sm font-semibold text-fg-muted hover:text-fg hover:underline">
        Clear all
      </Link>
    </div>
  );
}
