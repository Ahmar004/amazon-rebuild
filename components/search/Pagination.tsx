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

// Pill pagination: "< Previous", page numbers with an ellipsis, "Next >"
// (docs/design.md 6.3).
export function Pagination({ query, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const current = query.page;

  return (
    <nav aria-label="Search results pages" className="mt-8 flex flex-wrap items-center justify-center gap-1 pb-4 text-sm">
      <PageLink query={query} page={current - 1} disabled={current <= 1}>
        Previous
      </PageLink>

      {pageNumbers(current, totalPages).map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-fg-muted">
            ...
          </span>
        ) : (
          <PageLink key={page} query={query} page={page} current={page === current}>
            {page}
          </PageLink>
        ),
      )}

      <PageLink query={query} page={current + 1} disabled={current >= totalPages}>
        Next
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
    return <span className="rounded-md border border-border px-3 py-1.5 text-fg-muted opacity-60">{children}</span>;
  }
  return (
    <Link
      href={toSearchUrl(query, { page })}
      aria-current={current ? "page" : undefined}
      className={`rounded-md border px-3 py-1.5 transition ${
        current ? "border-accent bg-accent font-bold text-accent-fg" : "border-border bg-surface text-fg hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}
