import Link from "next/link";
import { toSearchUrl, type SearchQuery } from "@/lib/validation/search";

type PaginationProps = {
  query: SearchQuery;
  totalPages: number;
};

const SIBLING_COUNT = 2;

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, total, current]);
  for (let i = current - SIBLING_COUNT; i <= current + SIBLING_COUNT; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(sorted[i]);
  }
  return result;
}

// Amazon's pill pagination: "< Previous", page numbers with an ellipsis, "Next >"
// (docs/design.md 6.3).
export function Pagination({ query, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = query.page;

  return (
    <nav aria-label="Search results pages" className="mt-4 flex items-center justify-center gap-1 pb-8 text-sm">
      <PageLink query={query} page={current - 1} disabled={current <= 1}>
        {"< Previous"}
      </PageLink>

      {pageNumbers(current, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <PageLink key={page} query={query} page={page} current={page === current}>
            {page}
          </PageLink>
        ),
      )}

      <PageLink query={query} page={current + 1} disabled={current >= totalPages}>
        {"Next >"}
      </PageLink>
    </nav>
  );
}

function PageLink({
  query,
  page,
  disabled,
  current,
  children,
}: {
  query: SearchQuery;
  page: number;
  disabled?: boolean;
  current?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded border border-border px-3 py-1 text-text-muted">{children}</span>;
  }
  return (
    <Link
      href={toSearchUrl(query, { page })}
      aria-current={current ? "page" : undefined}
      className={`rounded border px-3 py-1 hover:bg-search-dept ${
        current ? "border-2 border-link font-bold text-text" : "border-border text-link"
      }`}
    >
      {children}
    </Link>
  );
}
