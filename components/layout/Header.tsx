import Link from "next/link";
import type { ReactNode } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { SearchBar } from "@/components/layout/SearchBar";
import { LanguagePopover } from "@/components/layout/LanguagePopover";
import { AccountFlyout } from "@/components/layout/AccountFlyout";
import { navItemClass } from "@/components/layout/navItemClass";
import { ROUTES } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type HeaderProps = {
  departments: Department[];
  /** Delivery-location slot; Task 3 fills it. */
  deliverTo: ReactNode;
  /** Cart slot; app/(shop)/layout.tsx fills it (Slice 5 will stream the real count). */
  cartLink: ReactNode;
};

// #nav-belt: 60px tall, bg-nav. Server component; SearchBar, LanguagePopover and AccountFlyout
// are the client islands it composes. Hidden below 768px, where HeaderMobile takes over
// (app/(shop)/layout.tsx, Task 4).
export function Header({ departments, deliverTo, cartLink }: HeaderProps) {
  return (
    <header id="nav-belt" className="hidden h-[60px] items-center gap-1 bg-nav px-[10px] md:flex">
      <Link href={ROUTES.home} className={`flex shrink-0 flex-col justify-center ${navItemClass}`}>
        <Sprite name="logo" label="Amazon" className="mt-[10px]" />
      </Link>

      {deliverTo}

      <SearchBar departments={departments} />

      <LanguagePopover />
      <AccountFlyout />

      <Link
        href={ROUTES.orders}
        className={`flex shrink-0 flex-col justify-center ${navItemClass}`}
      >
        <span className="text-xs leading-[14px] text-white">Returns</span>
        <span className="text-sm font-bold leading-[15px] text-white">&amp; Orders</span>
      </Link>

      {cartLink}
    </header>
  );
}
