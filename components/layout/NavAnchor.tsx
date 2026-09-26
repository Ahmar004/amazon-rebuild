import Link from "next/link";
import type { NavLink } from "@/lib/constants/links";

// Renders a NavLink from lib/constants/links.ts; every link is internal.
export function NavAnchor({ link, className }: { link: NavLink; className?: string }) {
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}
