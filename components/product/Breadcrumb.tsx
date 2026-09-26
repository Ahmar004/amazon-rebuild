import Link from "next/link";
import { ROUTES } from "@/lib/constants/links";

type BreadcrumbProps = {
  categoryPath: string[];
  categorySlug: string;
};

// Product page breadcrumb (docs/spec.md 5.5): the first segment links to the category browse
// page, later segments link to a search within that category for the segment's text
// (links to the search page filtered by segment and category).
export function Breadcrumb({ categoryPath, categorySlug }: BreadcrumbProps) {
  if (categoryPath.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
      {categoryPath.map((segment, i) => {
        const href =
          i === 0
            ? `${ROUTES.search}?i=${encodeURIComponent(categorySlug)}`
            : `${ROUTES.search}?k=${encodeURIComponent(segment)}&i=${encodeURIComponent(categorySlug)}`;
        return (
          <span key={`${segment}-${i}`}>
            {i > 0 && <span className="mx-1">&rsaquo;</span>}
            <Link href={href} className="text-accent hover:text-accent-hover hover:underline">
              {segment}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
