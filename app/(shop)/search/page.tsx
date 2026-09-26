import { Suspense } from "react";
import { getCategories } from "@/lib/data/categories";
import { searchProducts, PAGE_SIZE } from "@/lib/data/search";
import { appliedFilterChips } from "@/lib/search/chips";
import { parseSearchParams, type RawSearchParams, type SearchQuery } from "@/lib/validation/search";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { MobileFilters } from "@/components/search/MobileFilters";
import { AppliedFilters } from "@/components/search/AppliedFilters";
import { SortSelect } from "@/components/search/SortSelect";
import { Pagination } from "@/components/search/Pagination";
import { EmptyResults } from "@/components/search/EmptyResults";
import { ProductCard } from "@/components/product/ProductCard";

// Search results (frontend-rebuild.md C7): a responsive product-card grid, an applied-filters chip
// bar, a sticky filter rail from 768px and a bottom sheet below it. Every filter lives in the URL.
// searchParams is request-time data, so it is awaited inside <Suspense>; searchProducts itself is
// cached per query.
export default function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsForParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ResultsForParams({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return <Results query={parseSearchParams(await searchParams)} />;
}

async function Results({ query }: { query: SearchQuery }) {
  const [result, categories] = await Promise.all([searchProducts(query), getCategories()]);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const categoryName = result.category?.name ?? null;
  const start = result.total === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1;
  const end = Math.min(query.page * PAGE_SIZE, result.total);
  const heading = query.k ? `Results for "${query.k}"` : (categoryName ?? "All products");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-fg sm:text-2xl">{heading}</h1>
          <p className="mt-0.5 text-sm text-fg-muted">
            {result.total === 0
              ? "No results"
              : `${start.toLocaleString("en-US")}-${end.toLocaleString("en-US")} of ${result.total.toLocaleString("en-US")} results`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MobileFilters
            query={query}
            brandFacets={result.brandFacets}
            categories={categories}
            total={result.total}
            activeCount={appliedFilterChips(query, categoryName).length}
          />
          <SortSelect query={query} />
        </div>
      </div>

      <div className="mt-3">
        <AppliedFilters query={query} categoryName={categoryName} />
      </div>

      <div className="mt-4 flex gap-6">
        <div className="hidden w-[240px] shrink-0 self-start rounded-xl border border-border bg-surface p-4 shadow-card md:sticky md:top-28 md:block md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
          <FilterSidebar query={query} brandFacets={result.brandFacets} categories={categories} />
        </div>

        <div className="min-w-0 flex-1">
          {result.items.length === 0 ? (
            <EmptyResults query={query} />
          ) : (
            <>
              <ul className="stagger-in grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((item, i) => (
                  <li key={item.asin} className="animate-[rise-in_450ms_ease-out_both]" style={{ animationDelay: `${Math.min(i, 11) * 35}ms` }}>
                    <ProductCard item={item} />
                  </li>
                ))}
              </ul>
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
    <div aria-hidden="true">
      <div className="skeleton h-7 w-64 rounded-md" />
      <div className="skeleton mt-2 h-4 w-40 rounded-md" />
      <div className="mt-6 flex gap-6">
        <div className="skeleton hidden h-[480px] w-[240px] shrink-0 rounded-xl md:block" />
        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-[380px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
