import { Suspense } from "react";
import Link from "next/link";
import { CreditCard, MapPin, Package, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { listAddresses } from "@/lib/data/addresses";
import { listPaymentMethods } from "@/lib/data/payments";
import { getOrdersForUser } from "@/lib/data/orders";
import { orderStatus } from "@/lib/orders/status";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";
import { buttonClass } from "@/components/ui/Button";
import { PasswordForm, ProfileForm } from "@/components/account/ProfileForms";
import { AddressBook } from "@/components/account/AddressBook";
import { SavedCards } from "@/components/account/SavedCards";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

const TABS = [
  { id: "profile", label: "Profile & security", icon: UserRound },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "payments", label: "Payment methods", icon: CreditCard },
  { id: "orders", label: "Orders", icon: Package },
] as const;
type TabId = (typeof TABS)[number]["id"];

const RECENT_ORDERS = 5;

type AccountPageProps = { searchParams: Promise<{ tab?: string }> };

// One account page with tabs (C15) instead of a hub of separate pages. The tab lives in the URL
// (?tab=addresses), so it survives a reload and can be linked to. Reads the session, so it
// renders inside <Suspense>.
export default function AccountPage({ searchParams }: AccountPageProps) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <h1 className="text-2xl font-bold text-fg">Your account</h1>
      <Suspense fallback={<AccountSkeleton />}>
        <AccountContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AccountContent({ searchParams }: AccountPageProps) {
  const { tab: rawTab } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "profile";
  const user = await requireUser(`${ROUTES.account}?tab=${tab}`);

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]">
      <nav aria-label="Account sections" className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:px-0">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`${ROUTES.account}?tab=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-accent-soft text-accent" : "text-fg-muted hover:bg-surface-muted hover:text-fg"
            }`}
          >
            <t.icon size={17} aria-hidden="true" />
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="min-w-0 space-y-4">
        {tab === "profile" && (
          <>
            <ProfileForm name={user.name} email={user.email} />
            <PasswordForm />
          </>
        )}
        {tab === "addresses" && <AddressBook addresses={await listAddresses(user.id)} />}
        {tab === "payments" && <SavedCards cards={await listPaymentMethods(user.id)} />}
        {tab === "orders" && <RecentOrders userId={user.id} />}
      </div>
    </div>
  );
}

async function RecentOrders({ userId }: { userId: string }) {
  const now = new Date();
  const orders = (await getOrdersForUser(userId)).slice(0, RECENT_ORDERS);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        <p className="font-semibold text-fg">You haven&apos;t placed an order yet</p>
        <Link href={ROUTES.deals} className={buttonClass({ className: "rounded-full" })}>
          Browse today&apos;s deals
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <ul className="divide-y divide-border">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`${ROUTES.orders}/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-surface-muted">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.items[0]?.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 text-sm text-fg">
                  {order.items[0]?.title}
                  {order.items.length > 1 ? ` and ${order.items.length - 1} more` : ""}
                </span>
                <span className="block text-xs text-fg-muted">
                  {formatDeliveryDate(order.placedAt)} &middot; {formatPrice(order.totalCents)}
                </span>
              </span>
              <OrderStatusBadge status={orderStatus(order, now)} />
            </Link>
          </li>
        ))}
      </ul>
      <Link href={ROUTES.orders} className="block border-t border-border p-3 text-center text-sm font-semibold text-accent hover:underline">
        See all orders
      </Link>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mt-4 grid gap-6 md:grid-cols-[220px_1fr]" aria-hidden="true">
      <div className="h-40 animate-pulse rounded-xl bg-surface" />
      <div className="h-72 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}
