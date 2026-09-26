import { Suspense } from "react";
import Link from "next/link";
import { Tag } from "lucide-react";
import { getDeals, DEALS_PAGE_SIZE } from "@/lib/data/deals";
import { getDepartments } from "@/lib/data/departments";
import { dealsUrl, parseDealsParams, type DealsQuery } from "@/lib/validation/deals";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata = { title: "Today's Deals - Shopeedo" };

type RawParams = Record<string, string | string[] | undefined>;

// Today's Deals (frontend-rebuild.md C19): discounted products, biggest saving first, with
// department chips. The query lives in the URL; the data is cached per query.
export default function DealsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex items-center gap-3 rounded-2xl bg-linear-to-br from-hero-ember-from to-hero-ember-to px-5 py-6 text-hero-fg shadow-card sm:px-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Tag size={22} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Today&apos;s Deals</h1>
          <p className="text-sm text-white/85">Products selling below their list price, biggest savings first.</p>
        </div>
      </div>
      <Suspense fallback={<DealsSkeleton />}>
        <DealsForParams searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DealsForParams({ searchParams }: { searchParams: Promise<RawParams> }) {
  const query = parseDealsParams(await searchParams);
  const [deals, departments] = await Promise.all([getDeals(query), getDepartments()]);
  const totalPages = Math.max(1, Math.ceil(deals.total / DEALS_PAGE_SIZE));

  return (
    <>
      <nav aria-label="Deal departments" className="scrollbar-hide -mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href={dealsUrl({ page: 1 })} active={!query.dept}>
          All deals
        </Chip>
        {departments
          .filter((d) => deals.departmentCounts[d.slug])
          .map((d) => (
            <Chip key={d.slug} href={dealsUrl({ dept: d.slug, page: 1 })} active={query.dept === d.slug}>
              {d.name}
            </Chip>
          ))}
      </nav>

      <p className="mt-4 text-sm text-fg-muted">{deals.total.toLocaleString("en-US")} deals</p>

      {deals.items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
          <h2 className="text-lg font-bold text-fg">No deals here right now</h2>
          <Link href={dealsUrl({ page: 1 })} className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">
            See all deals
          </Link>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {deals.items.map((item, i) => (
            <li key={item.asin} className="animate-[rise-in_450ms_ease-out_both]" style={{ animationDelay: `${Math.min(i, 11) * 35}ms` }}>
              <ProductCard item={item} />
            </li>
          ))}
        </ul>
      )}

      <PageNav query={query} totalPages={totalPages} />
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        active ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-fg hover:border-accent hover:text-accent"
      }`}
    >
      {children}
    </Link>
  );
}

const PAGE_LINK = "rounded-md border border-border bg-surface px-4 py-1.5 text-sm text-fg hover:border-accent hover:text-accent";

function PageNav({ query, totalPages }: { query: DealsQuery; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Deal pages" className="mt-8 flex items-center justify-center gap-3 text-sm">
      <PageLink href={query.page > 1 ? dealsUrl({ ...query, page: query.page - 1 }) : null}>Previous</PageLink>
      <span className="text-fg-muted">
        Page {query.page} of {totalPages}
      </span>
      <PageLink href={query.page < totalPages ? dealsUrl({ ...query, page: query.page + 1 }) : null}>Next</PageLink>
    </nav>
  );
}

function PageLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return <span className={`${PAGE_LINK} opacity-50`}>{children}</span>;
  return (
    <Link href={href} className={PAGE_LINK}>
      {children}
    </Link>
  );
}

function DealsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton h-[380px] rounded-xl" />
      ))}
    </div>
  );
}
