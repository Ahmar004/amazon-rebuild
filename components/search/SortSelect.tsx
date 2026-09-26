"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants/sort";
import { toSearchUrl, type SearchQuery } from "@/lib/validation/search";

type SortSelectProps = {
  query: SearchQuery;
};

// The "Sort by:" pill: a real <select> that navigates on change (docs/design.md 6.3).
export function SortSelect({ query }: SortSelectProps) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-sm text-fg">
      Sort by:
      <select
        aria-label="Sort by"
        value={query.sort}
        onChange={(event) => router.push(toSearchUrl(query, { sort: event.target.value as SearchQuery["sort"] }))}
        className="cursor-pointer border-0 bg-transparent font-bold text-fg outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
