"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import type { OrderSummary } from "@/lib/data/orders";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants/orders";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { productHref, ROUTES } from "@/lib/constants/links";
import { buttonClass } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { tabClass } from "@/components/ui/tabs";

export type OrderListItem = OrderSummary & { status: OrderStatus };

const TABS = [
  { id: "all", label: "All orders", matches: () => true },
  { id: "open", label: "Not yet delivered", matches: (s: OrderStatus) => s !== ORDER_STATUS.delivered && s !== ORDER_STATUS.cancelled },
  { id: "cancelled", label: "Cancelled", matches: (s: OrderStatus) => s === ORDER_STATUS.cancelled },
] as const;

// Your Orders: status tabs and a search box over the shopper's own orders (already fetched and
// ownership-checked on the server, and few per shopper, so filtering stays on the client).
// Each status comes from the server's clock (lib/orders/status.ts).
export function OrdersList({ orders }: { orders: OrderListItem[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const normalized = query.trim().toLowerCase();
  const matchesTab = TABS.find((t) => t.id === tab)!.matches;
  const filtered = orders.filter(
    (order) =>
      matchesTab(order.status) &&
      (!normalized || order.id.toLowerCase().includes(normalized) || order.items.some((item) => item.title.toLowerCase().includes(normalized))),
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-fg">Your Orders</h1>
        <form onSubmit={(event: FormEvent) => event.preventDefault()} role="search" className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product or order #"
            aria-label="Search your orders"
            className="h-10 w-full rounded-full border border-border-strong bg-surface pl-9 pr-3 text-sm text-fg outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </form>
      </div>

      <div role="tablist" aria-label="Filter orders" className="mt-4 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={tabClass(tab === t.id, "px-3 pb-2")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Package size={26} aria-hidden="true" />
          </span>
          <p className="text-base font-semibold text-fg">{orders.length === 0 ? "You haven't placed an order yet" : "No orders match"}</p>
          <Link href={ROUTES.home} className={buttonClass({ className: "rounded-full" })}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="stagger-in mt-4 space-y-4">
          {filtered.map((order) => (
            <li key={order.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3 text-sm">
                <dl className="flex flex-wrap gap-x-6 gap-y-1">
                  <HeaderCell label="Placed" value={formatDeliveryDate(order.placedAt)} />
                  <HeaderCell label="Total" value={formatPrice(order.totalCents)} />
                  <HeaderCell label="Ship to" value={order.address.fullName} />
                  <HeaderCell label="Order #" value={order.id} />
                </dl>
                <Link href={`${ROUTES.orders}/${order.id}`} className={buttonClass({ variant: "secondary", size: "sm", className: "rounded-full" })}>
                  View order details
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm text-fg">
                  {order.status === ORDER_STATUS.cancelled
                    ? "Cancelled and refunded"
                    : order.status === ORDER_STATUS.delivered
                      ? `Delivered ${formatDeliveryDate(order.deliveryDate)}`
                      : `Arriving ${formatDeliveryDate(order.deliveryDate)}`}
                </span>
              </div>

              <ul className="divide-y divide-border px-4">
                {order.items.map((item) => (
                  <li key={item.asin} className="flex items-center gap-3 py-3">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={productHref(item.asin)} className="line-clamp-2 text-sm text-fg hover:text-accent">
                        {item.title}
                      </Link>
                      <p className="text-sm text-fg-muted">Qty: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HeaderCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-fg-muted">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}
