import Link from "next/link";
import type { NavLink } from "@/lib/constants/links";

// Renders a NavLink as an internal Next.js Link or an external anchor (new tab, per
// CLAUDE.md: links to Amazon features we don't build open the real page). Used across the
// sub-nav, side menu, account flyout and footer to avoid repeating the external/internal branch.
export function NavAnchor({ link, className }: { link: NavLink; className?: string }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}
