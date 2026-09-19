import Link from "next/link";
import type { ReactNode } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { SideMenu } from "@/components/layout/SideMenu";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { PersonIcon } from "@/components/layout/PersonIcon";
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
      <div className="flex h-12 items-center gap-3 bg-nav px-3">
        <SideMenu departments={departments} variant="mobile" />

        <Link href={ROUTES.home} className="flex shrink-0 items-center">
          <Sprite name="logo" label="Amazon" />
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <Link href={ROUTES.signIn} className="text-sm text-white">
            Sign in &#8250;
          </Link>
          <PersonIcon className="text-white" />
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
              style={{ color: "var(--color-search-icon)" }}
            >
              <circle cx="9.5" cy="9.5" r="7" stroke="currentColor" strokeWidth="2" />
              <line
                x1="14.5"
                y1="14.5"
                x2="20"
                y2="20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
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
