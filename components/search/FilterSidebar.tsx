"use client";

import { useState } from "react";
import Link from "next/link";
import { Stars } from "@/components/product/Stars";
import { toSearchUrl, type SearchQuery } from "@/lib/validation/search";
import type { Department } from "@/lib/data/departments";

type FilterSidebarProps = {
  query: SearchQuery;
  brandFacets: { name: string; count: number }[];
  departments: Department[];
};

const RATING_THRESHOLDS = [4, 3, 2, 1];
const BRANDS_VISIBLE = 8;
const PRICE_RANGES: { label: string; pminCents?: number; pmaxCents?: number }[] = [
  { label: "Up to $25", pmaxCents: 2500 },
  { label: "$25 to $50", pminCents: 2500, pmaxCents: 5000 },
  { label: "$50 to $100", pminCents: 5000, pmaxCents: 10000 },
  { label: "$100 to $200", pminCents: 10000, pmaxCents: 20000 },
  { label: "$200 & above", pminCents: 20000 },
];

// The left filter rail: Customer Reviews, Brands, Price, Department and Deals & Discounts
// (docs/design.md 6.3). A "See more"/"See less" toggle is the only client state; every filter
// itself is a plain link built with toSearchUrl so it works without JavaScript.
export function FilterSidebar({ query, brandFacets, departments }: FilterSidebarProps) {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const visibleBrands = showAllBrands ? brandFacets : brandFacets.slice(0, BRANDS_VISIBLE);

  return (
    <aside className="w-full shrink-0 text-sm md:w-[240px]">
      <FilterGroup title="Customer Reviews" active={query.minRating !== undefined} query={query} clearPatch={{ minRating: undefined }}>
        {RATING_THRESHOLDS.map((threshold) => (
          <Link
            key={threshold}
            href={toSearchUrl(query, { minRating: threshold })}
            className={`flex items-center gap-1 py-1 hover:text-accent-hover ${
              query.minRating === threshold ? "font-bold text-fg" : "text-fg"
            }`}
          >
            <Stars rating={threshold} size={12} />
            <span>&amp; Up</span>
          </Link>
        ))}
      </FilterGroup>

      {brandFacets.length > 0 && (
        <FilterGroup title="Brands" active={query.brands.length > 0} query={query} clearPatch={{ brands: [] }}>
          {visibleBrands.map((facet) => {
            const checked = query.brands.includes(facet.name);
            const brands = checked ? query.brands.filter((b) => b !== facet.name) : [...query.brands, facet.name];
            return (
              <Link
                key={facet.name}
                href={toSearchUrl(query, { brands })}
                className="flex items-center gap-2 py-1 text-fg hover:text-accent-hover"
              >
                <input type="checkbox" checked={checked} readOnly className="pointer-events-none" />
                <span>
                  {facet.name} ({facet.count})
                </span>
              </Link>
            );
          })}
          {brandFacets.length > BRANDS_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAllBrands((v) => !v)}
              className="py-1 text-accent hover:text-accent-hover hover:underline"
            >
              {showAllBrands ? "See less" : "See more"}
            </button>
          )}
        </FilterGroup>
      )}

      <FilterGroup
        title="Price"
        active={query.pminCents !== undefined || query.pmaxCents !== undefined}
        query={query}
        clearPatch={{ pminCents: undefined, pmaxCents: undefined }}
      >
        {PRICE_RANGES.map((range) => (
          <Link
            key={range.label}
            href={toSearchUrl(query, { pminCents: range.pminCents, pmaxCents: range.pmaxCents })}
            className={`py-1 hover:text-accent-hover ${
              query.pminCents === range.pminCents && query.pmaxCents === range.pmaxCents
                ? "font-bold text-fg"
                : "text-fg"
            }`}
          >
            {range.label}
          </Link>
        ))}
        <PriceForm query={query} />
      </FilterGroup>

      {!query.dept && (
        <FilterGroup title="Department" query={query}>
          {departments.map((department) => (
            <Link
              key={department.slug}
              href={toSearchUrl(query, { dept: department.slug })}
              className="py-1 text-fg hover:text-accent-hover"
            >
              {department.name}
            </Link>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Deals & Discounts" active={query.dealsOnly} query={query} clearPatch={{ dealsOnly: false }}>
        <Link
          href={toSearchUrl(query, { dealsOnly: !query.dealsOnly })}
          className={`py-1 hover:text-accent-hover ${query.dealsOnly ? "font-bold text-fg" : "text-fg"}`}
        >
          All Discounts
        </Link>
      </FilterGroup>
    </aside>
  );
}

type FilterGroupProps = {
  title: string;
  active?: boolean;
  query: SearchQuery;
  clearPatch?: Partial<SearchQuery>;
  children: React.ReactNode;
};

function FilterGroup({ title, active, query, clearPatch, children }: FilterGroupProps) {
  return (
    <div className="mb-4 border-b border-border pb-3">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-bold text-fg">{title}</h3>
        {active && clearPatch && (
          <Link href={toSearchUrl(query, clearPatch)} className="text-xs text-accent hover:text-accent-hover hover:underline">
            Clear
          </Link>
        )}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function PriceForm({ query }: { query: SearchQuery }) {
  return (
    <form action="/s" method="get" className="mt-2 flex items-center gap-1">
      {query.k && <input type="hidden" name="k" value={query.k} />}
      {query.dept && <input type="hidden" name="i" value={query.dept} />}
      <label className="sr-only" htmlFor="pmin">
        Minimum price
      </label>
      <span className="text-fg-muted">$</span>
      <input
        id="pmin"
        name="pmin"
        type="number"
        min={0}
        defaultValue={query.pminCents !== undefined ? query.pminCents / 100 : undefined}
        placeholder="Min"
        className="w-14 rounded border border-border px-1 py-1"
      />
      <span className="text-fg-muted">-</span>
      <label className="sr-only" htmlFor="pmax">
        Maximum price
      </label>
      <span className="text-fg-muted">$</span>
      <input
        id="pmax"
        name="pmax"
        type="number"
        min={0}
        defaultValue={query.pmaxCents !== undefined ? query.pmaxCents / 100 : undefined}
        placeholder="Max"
        className="w-14 rounded border border-border px-1 py-1"
      />
      <button type="submit" className="rounded border border-border bg-surface-muted px-2 py-1 text-xs hover:bg-surface-muted">
        Go
      </button>
    </form>
  );
}
