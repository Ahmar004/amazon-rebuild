import { SortSelect } from "@/components/search/SortSelect";
import { PAGE_SIZE } from "@/lib/data/search";
import type { SearchQuery } from "@/lib/validation/search";

type ResultsHeaderProps = {
  query: SearchQuery;
  total: number;
  departmentName: string | null;
};

// Full-width white bar above the results: "1-16 of 132 results for <query>" plus the sort
// dropdown (docs/design.md 6.3, recon 2-search-bar-results-scroll-*.png).
export function ResultsHeader({ query, total, departmentName }: ResultsHeaderProps) {
  const start = total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(query.page * PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2 shadow-sm">
      <p className="text-sm text-fg">
        {start}-{end} of {total.toLocaleString("en-US")} results
        {query.k ? (
          <>
            {" "}
            for <span className="font-bold text-accent">&quot;{query.k}&quot;</span>
          </>
        ) : departmentName ? (
          <> in {departmentName}</>
        ) : null}
      </p>
      <SortSelect query={query} />
    </div>
  );
}
