import { Suspense } from "react";
import Link from "next/link";
import { DollarSign, LayoutGrid, PackageCheck, PackagePlus, Store, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getSellerDashboard, SALES_CHART_DAYS } from "@/lib/data/seller";
import { ROUTES } from "@/lib/constants/links";
import { buttonClass } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SalesChart } from "@/components/seller/SalesChart";
import { DashboardCard, NeedsAttention, RecentSales, StatTile, TopListings } from "@/components/seller/DashboardParts";

export const metadata = { title: "Seller dashboard - Shopeedo" };

// Seller dashboard (point 15, D4): four headline numbers, daily sales and best sellers as charts,
// what needs doing, and the latest sales. User-owned, so it renders at request time in <Suspense>.
export default function SellerDashboardPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-fg sm:text-2xl">Seller dashboard</h1>
          <p className="text-sm text-fg-muted">How your listings are selling. Cancelled orders are left out.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={ROUTES.sellerOrders} className={buttonClass({ variant: "secondary", className: "rounded-full" })}>
            <Truck size={16} aria-hidden="true" />
            Seller orders
          </Link>
          <Link href={ROUTES.sellerListings} className={buttonClass({ variant: "secondary", className: "rounded-full" })}>
            <LayoutGrid size={16} aria-hidden="true" />
            Your listings
          </Link>
          <Link href={ROUTES.sellItem} className={buttonClass({ className: "rounded-full" })}>
            <PackagePlus size={16} aria-hidden="true" />
            Sell an item
          </Link>
        </div>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const user = await requireUser(ROUTES.sellerDashboard);
  const data = await getSellerDashboard(user.id, new Date());

  if (!data.hasHistory) {
    return (
      <EmptyState icon={Store} title="Start selling on Shopeedo" action={{ label: "Sell your first item", href: ROUTES.sellItem }}>
        List something in a couple of minutes. Your sales, best sellers and orders to ship will show up here.
      </EmptyState>
    );
  }

  const { stats } = data;
  return (
    <div className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile index={0} icon={DollarSign} label="Sales" value={stats.salesCents} format="price" />
        <StatTile index={1} icon={Truck} label="To ship" value={stats.toShip} format="count" />
        <StatTile index={2} icon={PackageCheck} label="Units sold" value={stats.unitsSold} format="count" />
        <StatTile index={3} icon={Store} label="Active listings" value={stats.activeListings} format="count" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <DashboardCard title="Daily sales" subtitle={`Last ${SALES_CHART_DAYS} days, in US dollars`}>
          <SalesChart days={data.daily} />
        </DashboardCard>
        <DashboardCard title="Best sellers" subtitle="Sales per listing, all time (amount · units)">
          <TopListings listings={data.topListings} />
        </DashboardCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <DashboardCard title="Needs attention" subtitle="Sales to ship and listings out of stock">
          <NeedsAttention toShip={data.toShip} outOfStock={data.outOfStock} />
        </DashboardCard>
        <DashboardCard title="Recent sales" subtitle="Ship them from Seller orders">
          <RecentSales sales={data.recentSales} />
        </DashboardCard>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mt-5 space-y-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-[74px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div className="skeleton h-80 rounded-xl" />
        <div className="skeleton h-80 rounded-xl" />
      </div>
    </div>
  );
}
