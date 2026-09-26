import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { BackToTop } from "@/components/layout/BackToTop";
import { SafetyNotice } from "@/components/layout/SafetyNotice";
import { FOOTER_COLUMNS, ROUTES } from "@/lib/constants/links";
import type { Department } from "@/lib/data/departments";

const FOOTER_DEPARTMENTS = 8;
// A fixed year: new Date() during prerender makes the page dynamic under cacheComponents.
const COPYRIGHT_YEAR = 2026;

// One fluid footer for every screen size: brand, link columns (shop, departments, account), then
// the copyright line and the demo notice. Replaces the old desktop/mobile footer pair.
export function Footer({ departments, compact = false }: { departments?: Department[]; compact?: boolean }) {
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      {!compact && <BackToTop />}
      {!compact && (
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <Link href={ROUTES.home} aria-label="Shopeedo home">
              <Logo />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-fg-muted">Everyday products, honest prices and a checkout that takes one page.</p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
          {departments && departments.length > 0 && (
            <FooterColumn
              title="Departments"
              links={departments.slice(0, FOOTER_DEPARTMENTS).map((d) => ({ label: d.name, href: `${ROUTES.search}?i=${d.slug}` }))}
            />
          )}
        </div>
      )}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-5 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>&copy; {COPYRIGHT_YEAR} Shopeedo</p>
          <SafetyNotice />
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-bold text-fg">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <NavAnchor link={link} className="text-sm text-fg-muted hover:text-accent" />
          </li>
        ))}
      </ul>
    </div>
  );
}
