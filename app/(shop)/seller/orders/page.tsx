import { Suspense } from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getSoldItems } from "@/lib/data/seller-orders";
import { groupSellerOrders, parseSellerOrderTab, sellerItemTab } from "@/lib/seller/orders";
import { SELLER_ORDER_TABS, type SellerOrderTab } from "@/lib/constants/seller";
import { ROUTES } from "@/lib/constants/links";
import { EmptyState } from "@/components/ui/EmptyState";
import { SoldOrderCard } from "@/components/seller/SoldOrderCard";
import { tabClass } from "@/components/ui/tabs";

export const metadata = { title: "Seller orders - Shopeedo" };

type SellerOrdersPageProps = { searchParams: Promise<{ tab?: string }> };

const EMPTY_TEXT: Record<SellerOrderTab, string> = {
  "to-ship": "Nothing to ship right now. New sales land here first.",
  shipped: "Nothing on the way. Items you mark as shipped wait here until you mark them delivered.",
  delivered: "No deliveries yet.",
  cancelled: "No cancelled sales.",
};

// Seller orders (point 15, D3): sold items grouped by order, filed under To ship, On the way,
// Delivered and Cancelled. The tab lives in the URL; the page reads the session, so it renders
// inside <Suspense>.
export default function SellerOrdersPage({ searchParams }: SellerOrdersPageProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-6 sm:py-6">
      <h1 className="text-xl font-bold text-fg sm:text-2xl">Seller orders</h1>
      <p className="text-sm text-fg-muted">Ship each sale, then mark it delivered. Buyers see every step on their order.</p>
      <Suspense fallback={<div className="skeleton mt-6 h-72 rounded-xl" aria-hidden="true" />}>
        <SoldOrders searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SoldOrders({ searchParams }: SellerOrdersPageProps) {
  const [user, { tab: rawTab }] = await Promise.all([requireUser(ROUTES.sellerOrders), searchParams]);
  const tab = parseSellerOrderTab(rawTab);
  const items = await getSoldItems(user.id);

  const counts = Object.fromEntries(SELLER_ORDER_TABS.map((t) => [t.id, 0])) as Record<SellerOrderTab, number>;
  for (const item of items) counts[sellerItemTab(item)] += 1;
  const orders = groupSellerOrders(items.filter((item) => sellerItemTab(item) === tab));

  return (
    <>
      <nav aria-label="Filter sales" className="mt-4 flex gap-1 overflow-x-auto border-b border-border">
        {SELLER_ORDER_TABS.map((t) => (
          <Link
            key={t.id}
            href={`${ROUTES.sellerOrders}?tab=${t.id}`}
            aria-current={t.id === tab ? "page" : undefined}
            className={tabClass(t.id === tab, "inline-flex items-center gap-1.5 px-3 pb-2")}
          >
            {t.label}
            <span className={`rounded-full px-1.5 text-xs ${t.id === tab ? "bg-accent text-accent-fg" : "bg-surface-muted"}`}>{counts[t.id]}</span>
          </Link>
        ))}
      </nav>
      {orders.length === 0 ? (
        items.length === 0 ? (
          <EmptyState icon={PackageOpen} title="No sales yet" action={{ label: "Sell an item", href: ROUTES.sellItem }}>
            When someone buys one of your listings, the order shows up here with the address to ship to.
          </EmptyState>
        ) : (
          <EmptyState icon={PackageOpen} title="All clear">
            {EMPTY_TEXT[tab]}
          </EmptyState>
        )
      ) : (
        <ul className="stagger-in mt-4 space-y-3">
          {orders.map((order) => (
            <SoldOrderCard key={order.orderId} orderId={order.orderId} items={order.items} />
          ))}
        </ul>
      )}
    </>
  );
}
