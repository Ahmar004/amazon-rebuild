import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { OrdersMenu } from "@/components/layout/OrdersMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { WishlistLink } from "@/components/wishlist/WishlistLink";
import { ROUTES } from "@/lib/constants/links";
import type { Category } from "@/lib/data/categories";

type HeaderProps = {
  categories: Category[];
  /** The All menu, account menu and cart read the session or cart cookie, so the layout passes
   * them in wrapped in <Suspense>. */
  allMenu: ReactNode;
  accountMenu: ReactNode;
  cartLink: ReactNode;
  /** The Buying / Selling switch and quick links; reads the mode cookie, so it arrives in <Suspense>. */
  modeBar: ReactNode;
};

// One fluid, sticky header for every screen size (C9): menu, logo, search, theme, account, orders
// and cart. The search bar sits inline from 768px and wraps onto its own full-width row below it
// (a single element, re-ordered with CSS). The second row holds the Buying / Selling switch and quick links, which scroll sideways on small screens.
export function Header({ categories, allMenu, accountMenu, cartLink, modeBar }: HeaderProps) {
  return (
    <header className="header-elevate sticky top-0 z-40 border-b border-border bg-surface">
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
          <OrdersMenu />
          {cartLink}
        </div>
      </div>
      <div className="border-t border-border">{modeBar}</div>
    </header>
  );
}
