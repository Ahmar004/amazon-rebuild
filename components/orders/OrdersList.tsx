"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrderSummary } from "@/lib/data/orders";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";

// The order list and its search box (docs/spec.md 5.8): filtering is
// client-side over the already-fetched, ownership-checked orders (small dataset per user, so no
// need for a server round trip per keystroke).
export function OrdersList({ orders }: { orders: OrderSummary[] }) {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? orders.filter(
        (order) =>
          order.id.toLowerCase().includes(normalized) ||
          order.items.some((item) => item.title.toLowerCase().includes(normalized)),
      )
    : orders;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl text-fg">Your Orders</h1>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex w-full max-w-sm shrink-0"
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all orders"
            aria-label="Search all orders"
            className="min-w-0 flex-1 rounded-l border border-r-0 border-border px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="shrink-0 rounded-r bg-inverse-muted px-4 py-2 text-sm font-medium text-white hover:bg-inverse-muted"
          >
            Search Orders
          </button>
        </form>
      </div>

      <div className="mt-4 border-b border-border">
        <span className="inline-block border-b-2 border-accent pb-2 text-sm font-bold text-fg">Orders</span>
      </div>

      <p className="mt-4 text-sm text-fg">
        {filtered.length} {filtered.length === 1 ? "order" : "orders"} placed
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-border bg-surface p-6 text-center">
          <p className="text-sm text-fg">
            {orders.length === 0 ? "You have no orders yet." : "No orders match your search."}
          </p>
          <Link
            href={ROUTES.home}
            className="mt-3 inline-block rounded-full border border-accent bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-hover"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {filtered.map((order) => (
            <li key={order.id} className="rounded border border-border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-muted px-4 py-3">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-fg-muted">ORDER PLACED</p>
                    <p className="text-sm text-fg">{formatDeliveryDate(order.placedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-fg-muted">TOTAL</p>
                    <p className="text-sm text-fg">{formatPrice(order.totalCents)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-fg-muted">SHIP TO</p>
                    <p className="text-sm text-fg">{order.address.fullName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-fg-muted">ORDER # {order.id}</p>
                  <Link
                    href={`${ROUTES.checkout}/thankyou/${order.id}`}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-fg hover:bg-surface-muted"
                  >
                    View order details
                  </Link>
                </div>
              </div>

              <ul className="divide-y divide-border px-4">
                {order.items.map((item) => (
                  <li key={item.asin} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className="h-16 w-16 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-accent hover:text-accent-hover">{item.title}</p>
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
