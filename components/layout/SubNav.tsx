import { NavAnchor } from "@/components/layout/NavAnchor";
import { SideMenu } from "@/components/layout/SideMenu";
import { SUBNAV_LINKS } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

// #nav-main: 39px tall, bg-subnav. Server component; SideMenu is the only client island (it
// owns the "All" button and the drawer it opens).
export function SubNav({ departments }: { departments: Department[] }) {
  return (
    <nav aria-label="Secondary" className="flex h-[39px] items-center gap-1 bg-subnav px-2.5 text-white">
      <SideMenu departments={departments} />
      {SUBNAV_LINKS.map((link) => (
        <NavAnchor
          key={link.label}
          link={link}
          className="rounded-sm border border-transparent px-[9px] py-1 text-sm hover:border-white"
        />
      ))}
    </nav>
  );
}
