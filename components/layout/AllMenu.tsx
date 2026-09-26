"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, UserRound } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { SignOutForm } from "@/components/layout/SignOutForm";
import { ACCOUNT_LINKS, ROUTES, SIDE_MENU_TRENDING, type NavLink } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type AllMenuProps = {
  departments: Department[];
  /** The signed-in shopper's first name, streamed in by the layout. */
  firstName: ReactNode;
};

// The "All" button and the side sheet it opens (frontend-rebuild.md point 9). Every section is
// built from props the shop layout passes on every page, so the menu is identical wherever it is
// opened. It closes when a link is followed or the route changes.
export function AllMenu({ departments, firstName }: AllMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = () => setOpen(false);
  const departmentLinks: NavLink[] = departments.map((d) => ({ label: d.name, href: `${ROUTES.search}?i=${d.slug}` }));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-fg hover:bg-surface-muted"
      >
        <Menu size={20} aria-hidden="true" />
        <span className="hidden sm:inline">All</span>
        <span className="sr-only sm:hidden">Open menu</span>
      </button>

      <Sheet open={open} onClose={close} title="Browse Shopeedo" side="left">
        <div className="flex items-center gap-3 border-b border-border bg-surface-muted px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-fg">
            <UserRound size={18} aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-fg">Hello, {firstName}</p>
        </div>
        <MenuSection title="Trending" links={SIDE_MENU_TRENDING} onNavigate={close} />
        <MenuSection title="Shop by department" links={departmentLinks} onNavigate={close} />
        <MenuSection title="Your account" links={ACCOUNT_LINKS} onNavigate={close}>
          <SignOutForm className="block w-full px-4 py-2.5 text-left text-sm text-fg hover:bg-surface-muted">Sign out</SignOutForm>
        </MenuSection>
      </Sheet>
    </>
  );
}

function MenuSection({ title, links, onNavigate, children }: { title: string; links: NavLink[]; onNavigate: () => void; children?: ReactNode }) {
  return (
    <section className="border-b border-border py-2 last:border-b-0">
      <h3 className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-fg-muted">{title}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onNavigate} className="block px-4 py-2.5 text-sm text-fg hover:bg-surface-muted hover:text-accent">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
