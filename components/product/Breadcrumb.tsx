import Link from "next/link";
import { ROUTES } from "@/lib/constants/links";

type BreadcrumbProps = {
  categoryPath: string[];
  departmentSlug: string;
};

// Product page breadcrumb (docs/spec.md 5.5): the first segment links to the department browse
// page, later segments link to a search within that department for the segment's text
// (links to the search page filtered by segment and department).
export function Breadcrumb({ categoryPath, departmentSlug }: BreadcrumbProps) {
  if (categoryPath.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-fg-muted">
      {categoryPath.map((segment, i) => {
        const href =
          i === 0
            ? `${ROUTES.search}?i=${encodeURIComponent(departmentSlug)}`
            : `${ROUTES.search}?k=${encodeURIComponent(segment)}&i=${encodeURIComponent(departmentSlug)}`;
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
