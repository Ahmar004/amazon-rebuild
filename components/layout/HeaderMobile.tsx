import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { SideMenu } from "@/components/layout/SideMenu";
import { SideMenuSession } from "@/components/layout/SideMenuSession";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { HeaderMobileAccount, HeaderMobileAccountFallback } from "@/components/layout/HeaderMobileAccount";
import { SearchIcon } from "@/components/layout/SearchIcon";
import { MOBILE_LINK_ROW, ROUTES } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type HeaderMobileProps = {
  departments: Department[];
  /** Delivery-location row (row 4); app/(shop)/layout.tsx fills it with DeliverTo variant="mobile". */
  deliverTo: ReactNode;
  /** Cart slot (row 1); app/(shop)/layout.tsx fills it with CartLink variant="mobile". */
  cartLink: ReactNode;
};

// Mobile web header (<768px; Header/SubNav take over from 768px, app/(shop)/layout.tsx): logo
// row, full-width search, a horizontally scrolling quick-links row and the deliver-to row.
// Values and layout from task-4-brief.md and docs/recon/mobile-app-views-captured.
export function HeaderMobile({ departments, deliverTo, cartLink }: HeaderMobileProps) {
  return (
    <header className="md:hidden">
      <div className="flex h-12 w-full min-w-0 items-center gap-2 bg-nav px-3">
        <Suspense fallback={<SideMenu departments={departments} variant="mobile" user={null} />}>
          <SideMenuSession departments={departments} variant="mobile" />
        </Suspense>

        <Link href={ROUTES.home} className="flex shrink-0 items-center">
          <Sprite name="logo" label="Amazon" />
        </Link>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
          <Suspense fallback={<HeaderMobileAccountFallback />}>
            <HeaderMobileAccount />
          </Suspense>
          {cartLink}
        </div>
      </div>

      <form action={ROUTES.search} method="get" className="bg-nav px-3 pb-3">
        <label htmlFor="search-mobile" className="sr-only">
          Search Amazon
        </label>
        <div className="flex h-11 overflow-hidden rounded-lg bg-white focus-within:ring-[3px] focus-within:ring-search-btn">
          <input
            id="search-mobile"
            name="k"
            type="text"
            placeholder="Search Amazon"
            className="min-w-0 flex-1 border-0 pl-3 text-[15px] text-text outline-none"
          />
          <button
            type="submit"
            aria-label="Go"
            className="flex w-12 shrink-0 items-center justify-center bg-search-btn hover:bg-search-btn-hover"
          >
            <SearchIcon size={20} />
          </button>
        </div>
      </form>

      <nav
        aria-label="Quick links"
        className="scrollbar-hide flex gap-4 overflow-x-auto whitespace-nowrap bg-subnav px-3 py-2.5 text-sm text-white"
      >
        {MOBILE_LINK_ROW.map((link) => (
          <NavAnchor key={link.label} link={link} className="shrink-0" />
        ))}
      </nav>

      {deliverTo}
    </header>
  );
}
