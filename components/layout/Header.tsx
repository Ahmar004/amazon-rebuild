import Link from "next/link";
import type { ReactNode } from "react";
import { Package } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { WishlistLink } from "@/components/wishlist/WishlistLink";
import { ROUTES, SUBNAV_LINKS } from "@/lib/constants/links";
import type { Category } from "@/lib/data/categories";

type HeaderProps = {
  categories: Category[];
  /** The All menu, account menu and cart read the session or cart cookie, so the layout passes
   * them in wrapped in <Suspense>. */
  allMenu: ReactNode;
  accountMenu: ReactNode;
  cartLink: ReactNode;
};

// One fluid, sticky header for every screen size (C9): menu, logo, search, theme, account, orders
// and cart. The search bar sits inline from 768px and wraps onto its own full-width row below it
// (a single element, re-ordered with CSS). The quick-links row scrolls sideways on small screens.
export function Header({ categories, allMenu, accountMenu, cartLink }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-2 gap-y-2 px-3 py-2.5 sm:gap-x-3 sm:px-6">
        {allMenu}
        <Link href={ROUTES.home} aria-label="Shopeedo home" className="shrink-0 rounded-md">
          <Logo />
        </Link>
        <div className="order-last flex w-full md:order-none md:w-auto md:flex-1">
          <SearchBar categories={categories} />
        </div>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <ThemeToggle className="text-fg hover:bg-surface-muted" />
          {accountMenu}
          <WishlistLink />
          <Link href={ROUTES.orders} className="hidden h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-fg hover:bg-surface-muted lg:inline-flex">
            <Package size={20} aria-hidden="true" />
            Orders
          </Link>
          {cartLink}
        </div>
      </div>
      <nav aria-label="Quick links" className="border-t border-border">
        <div className="scrollbar-hide mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-3 py-1.5 sm:px-6">
          {SUBNAV_LINKS.map((link) => (
            <NavAnchor key={link.href} link={link} className="shrink-0 rounded-full px-3 py-1 text-sm text-fg-muted hover:bg-surface-muted hover:text-fg" />
          ))}
        </div>
      </nav>
    </header>
  );
}
