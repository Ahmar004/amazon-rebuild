import Link from "next/link";
import type { ReactNode } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { SearchBar } from "@/components/layout/SearchBar";
import { LanguagePopover } from "@/components/layout/LanguagePopover";
import { AccountFlyout } from "@/components/layout/AccountFlyout";
import { CartLink } from "@/components/layout/CartLink";
import { ROUTES } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

type HeaderProps = {
  departments: Department[];
  /** Delivery-location slot; Task 3 fills it. */
  deliverTo: ReactNode;
};

const navItemClass =
  "flex flex-col justify-center rounded-sm border border-transparent px-[9px] py-1 text-white hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

// #nav-belt: 60px tall, bg-nav. Server component; SearchBar, LanguagePopover and AccountFlyout
// are the client islands it composes.
export function Header({ departments, deliverTo }: HeaderProps) {
  return (
    <header id="nav-belt" className="flex h-[60px] items-center gap-1 bg-nav px-[10px]">
      <Link href={ROUTES.home} className={`shrink-0 ${navItemClass}`}>
        <Sprite name="logo" label="Amazon" className="mt-[10px]" />
      </Link>

      {deliverTo}

      <SearchBar departments={departments} />

      <LanguagePopover />
      <AccountFlyout />

      <Link href={ROUTES.orders} className={`shrink-0 ${navItemClass}`}>
        <span className="text-xs leading-[14px] text-white">Returns</span>
        <span className="text-sm font-bold leading-[15px] text-white">&amp; Orders</span>
      </Link>

      <CartLink count={0} />
    </header>
  );
}
