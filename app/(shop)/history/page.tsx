import { Suspense } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getRecentlyViewed, HISTORY_KEEP } from "@/lib/data/history";
import { ROUTES } from "@/lib/constants/links";
import { ProductCard } from "@/components/product/ProductCard";
import { ClearHistoryButton, RemoveFromHistoryButton } from "@/components/history/HistoryControls";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Browsing history - Shopeedo" };

// The products this shopper viewed, newest first, with per-item remove and clear-all. User-owned,
// so it renders at request time inside <Suspense>.
export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
      <Suspense fallback={<div className="skeleton h-[420px] rounded-2xl" aria-hidden="true" />}>
        <HistoryItems />
      </Suspense>
    </div>
  );
}

async function HistoryItems() {
  const user = await requireUser(ROUTES.history);
  const items = await getRecentlyViewed(user.id, HISTORY_KEEP);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-fg sm:text-2xl">Browsing history</h1>
          <p className="mt-0.5 text-sm text-fg-muted">Products you viewed recently. Only you can see this.</p>
        </div>
        {items.length > 0 && <ClearHistoryButton />}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
          <History size={40} className="text-fg-muted" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-fg">No browsing history yet</h2>
          <p className="mt-1 max-w-sm text-sm text-fg-muted">Products you open will show up here, so you can find them again.</p>
          <Link href={ROUTES.home} className={buttonClass({ className: "mt-5" })}>
            Start browsing
          </Link>
        </div>
      ) : (
        <ul className="stagger-in mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <li key={item.asin}>
              <ProductCard item={item} note={<RemoveFromHistoryButton asin={item.asin} />} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
