import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { appliedFilterChips, clearFiltersUrl } from "@/lib/search/chips";
import { ROUTES } from "@/lib/constants/links";
import type { SearchQuery } from "@/lib/validation/search";

// The no-results state: says what was searched and offers a way out (clear filters, or browse).
export function EmptyResults({ query }: { query: SearchQuery }) {
  const hasFilters = appliedFilterChips(query, null).length > 0;
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <SearchX size={40} className="text-fg-muted" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-bold text-fg">
        {query.k ? <>No results for &quot;{query.k}&quot;</> : "No products match these filters"}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">Try a different spelling, a more general word, or fewer filters.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasFilters && (
          <Link href={clearFiltersUrl(query)} className={buttonClass({})}>
            Clear filters
          </Link>
        )}
        <Link href={ROUTES.search} className={buttonClass({ variant: "secondary" })}>
          Browse all products
        </Link>
      </div>
    </div>
  );
}
