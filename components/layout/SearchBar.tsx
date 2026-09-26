"use client";

import { Suspense, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Department } from "@/lib/data/departments";
import { ChevronDown, Search } from "lucide-react";
import { useTypeahead } from "@/hooks/useTypeahead";
import { ROUTES } from "@/lib/constants/links";

type SearchBarProps = {
  departments: Department[];
};

// useSearchParams() (used to keep the field synced with /search) needs a Suspense boundary, since its
// value is only known at request time. SearchBarFallback is the same static shell so there is no
// layout shift while it resolves.
export function SearchBar({ departments }: SearchBarProps) {
  return (
    <Suspense fallback={<SearchBarFallback departments={departments} />}>
      <SearchBarInner departments={departments} />
    </Suspense>
  );
}

function SearchBarInner({ departments }: SearchBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const onResultsPage = pathname === ROUTES.search;

  const [dept, setDept] = useState(() => (onResultsPage ? (searchParams.get("i") ?? "") : ""));
  const [query, setQuery] = useState(() => (onResultsPage ? (searchParams.get("k") ?? "") : ""));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectRef = useRef<HTMLSelectElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Keeps the field synced with the URL when the user searches again from the results page.
  // Adjusted during render (React's documented pattern for deriving state from a changed prop)
  // rather than in an effect, so it takes effect before the stale value ever paints.
  const [syncedSearchParams, setSyncedSearchParams] = useState(searchParams);
  if (onResultsPage && searchParams !== syncedSearchParams) {
    setSyncedSearchParams(searchParams);
    setDept(searchParams.get("i") ?? "");
    setQuery(searchParams.get("k") ?? "");
  }

  const { suggestions } = useTypeahead(query);

  const [suggestionsForActiveIndex, setSuggestionsForActiveIndex] = useState(suggestions);
  if (suggestions !== suggestionsForActiveIndex) {
    setSuggestionsForActiveIndex(suggestions);
    setActiveIndex(-1);
  }

  const selectedLabel = dept === "" ? "All" : (departments.find((d) => d.slug === dept)?.name ?? "All");
  const showSuggestions = open && suggestions.length > 0;

  function handleSubmit() {
    // Empty "i" is not sent: disable the select just before the native GET submit collects
    // form data, then re-enable it so the control stays usable afterwards.
    if (dept === "" && selectRef.current) {
      selectRef.current.disabled = true;
      setTimeout(() => {
        if (selectRef.current) selectRef.current.disabled = false;
      }, 0);
    }
    setOpen(false);
  }

  function submitWith(value: string) {
    setQuery(value);
    setOpen(false);
    const params = new URLSearchParams();
    params.set("k", value);
    if (dept) params.set("i", dept);
    router.push(`${ROUTES.search}?${params.toString()}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      submitWith(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close search suggestions"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 hidden bg-overlay md:block"
        />
      )}

      <form
        ref={formRef}
        action={ROUTES.search}
        method="get"
        onSubmit={handleSubmit}
        className="relative z-40 flex h-10 flex-1 rounded-lg border border-border-strong bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
      >
        <div className="relative hidden shrink-0 items-center rounded-l-lg border-r border-border bg-surface-muted pl-3 pr-3 text-xs text-fg-muted sm:flex">
          <span className="whitespace-nowrap">{selectedLabel}</span>
          <ChevronDown size={14} className="ml-1" aria-hidden="true" />
          <select
            ref={selectRef}
            name="i"
            aria-label="Search in department"
            value={dept}
            onChange={(event) => setDept(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department.slug} value={department.slug}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <label htmlFor="search-input" className="sr-only">
          Search Shopeedo
        </label>
        <input
          id="search-input"
          name="k"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Shopeedo"
          className="min-w-0 flex-1 rounded-l-lg border-0 bg-transparent pl-3 text-[15px] text-fg placeholder:text-fg-muted outline-none sm:rounded-none"
        />

        <button
          type="submit"
          aria-label="Go"
          className="-m-px flex h-10 w-12 shrink-0 items-center justify-center rounded-r-lg bg-accent text-accent-fg hover:bg-accent-hover"
        >
          <Search size={20} aria-hidden="true" />
        </button>

        {showSuggestions && (
          <ul
            role="listbox"
            aria-label="Search suggestions"
            className="absolute left-0 right-12 top-full mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-pop"
          >
            {suggestions.map((suggestion, index) => {
              const matchLength = query.trim().length;
              const typed = suggestion.slice(0, matchLength);
              const rest = suggestion.slice(matchLength);
              return (
                <li key={suggestion} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => submitWith(suggestion)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-fg ${
                      index === activeIndex ? "bg-surface-muted" : ""
                    }`}
                  >
                    <Search size={14} aria-hidden="true" className="shrink-0 text-fg-muted" />
                    <span>
                      {typed}
                      <b>{rest}</b>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </form>
    </>
  );
}

// Static markup only (no state, no useSearchParams): ships in the prerendered shell while
// SearchBarInner resolves, then is replaced once it does. Still a real form, so search works
// even if JavaScript never loads.
function SearchBarFallback({ departments }: SearchBarProps) {
  return (
    <form
      action={ROUTES.search}
      method="get"
      className="flex h-10 flex-1 rounded-lg border border-border-strong bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30"
    >
      <div className="relative hidden shrink-0 items-center rounded-l-lg border-r border-border bg-surface-muted pl-3 pr-3 text-xs text-fg-muted sm:flex">
        <span className="whitespace-nowrap">All</span>
        <ChevronDown size={14} className="ml-1" aria-hidden="true" />
        <select name="i" aria-label="Search in department" defaultValue="" className="absolute inset-0 h-full w-full cursor-pointer opacity-0">
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.slug} value={department.slug}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <label htmlFor="search-input" className="sr-only">
        Search Shopeedo
      </label>
      <input
        id="search-input"
        name="k"
        type="text"
        placeholder="Search Shopeedo"
        className="min-w-0 flex-1 rounded-l-lg border-0 bg-transparent pl-3 text-[15px] text-fg placeholder:text-fg-muted outline-none sm:rounded-none"
      />

      <button
        type="submit"
        aria-label="Go"
        className="-m-px flex h-10 w-12 shrink-0 items-center justify-center rounded-r-lg bg-accent text-accent-fg hover:bg-accent-hover"
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </form>
  );
}
