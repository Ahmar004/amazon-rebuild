import { Suspense } from "react";
import { getDepartments } from "@/lib/data/departments";
import { searchProducts, PAGE_SIZE } from "@/lib/data/search";
import { parseSearchParams, type RawSearchParams, type SearchQuery } from "@/lib/validation/search";
import { ResultsHeader } from "@/components/search/ResultsHeader";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { MobileFilters } from "@/components/search/MobileFilters";
import { ResultRow } from "@/components/search/ResultRow";
import { Pagination } from "@/components/search/Pagination";
import { EmptyResults } from "@/components/search/EmptyResults";

// Search results page (docs/design.md 6.3). Reads searchParams directly (request-time, so the
// page renders dynamically rather than under 'use cache'); the data fetch itself streams inside
// <Suspense> so the sidebar shell can ship while searchProducts (its own 'use cache' function)
// resolves.
export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <div className="mx-auto max-w-[1500px] bg-surface px-4 py-3 md:bg-surface">
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsForParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// searchParams is only known at request time, so it is awaited here, inside the Suspense
// boundary, rather than at the top of the page (docs caching guide: "streaming uncached data").
async function ResultsForParams({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const raw = await searchParams;
  const query = parseSearchParams(raw);
  return <Results query={query} />;
}

async function Results({ query }: { query: SearchQuery }) {
  const [result, departments] = await Promise.all([searchProducts(query), getDepartments()]);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const now = new Date();

  return (
    <>
      <div className="-mx-4 -mt-3 mb-3">
        <div className="flex items-center justify-between gap-2 px-4 py-2 md:hidden">
          <p className="text-sm text-fg">{result.total.toLocaleString("en-US")} results</p>
          <MobileFilters query={query} brandFacets={result.brandFacets} departments={departments} total={result.total} />
        </div>
        <div className="hidden md:block">
          <ResultsHeader query={query} total={result.total} departmentName={result.department?.name ?? null} />
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden md:block">
          <FilterSidebar query={query} brandFacets={result.brandFacets} departments={departments} />
        </div>

        <div className="min-w-0 flex-1">
          {result.items.length === 0 ? (
            <EmptyResults query={query.k} />
          ) : (
            <>
              {result.items.map((item) => (
                <ResultRow key={item.asin} item={item} now={now} />
              ))}
              <Pagination query={query} totalPages={totalPages} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="hidden w-[240px] shrink-0 md:block" aria-hidden="true">
        <div className="h-64 animate-pulse rounded bg-surface-muted" />
      </div>
      <div className="min-w-0 flex-1 space-y-4" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border py-4">
            <div className="h-40 w-[40%] animate-pulse rounded bg-surface-muted md:w-[240px]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
