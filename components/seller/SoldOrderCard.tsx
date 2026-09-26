import Link from "next/link";
import { MapPin } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { FulfilmentButton } from "@/components/seller/FulfilmentButton";
import { productHref } from "@/lib/constants/links";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants/orders";
import { FULFILMENT_STEP } from "@/lib/constants/seller";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import type { SoldItem } from "@/lib/data/seller-orders";

const TIME = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });

function statusOf(item: SoldItem): OrderStatus {
  if (item.cancelledAt) return ORDER_STATUS.cancelled;
  if (item.deliveredAt) return ORDER_STATUS.delivered;
  if (item.shippedAt) return ORDER_STATUS.shipped;
  return ORDER_STATUS.ordered;
}

// One order as its seller sees it (D3): where it goes and by when, and each of the seller's items
// in it with the next step to take. Buyers' other items in the same order aren't shown.
export function SoldOrderCard({ orderId, items, index }: { orderId: string; items: SoldItem[]; index: number }) {
  const first = items[0];
  const { address } = first;
  return (
    <li
      className="rounded-xl border border-border bg-surface shadow-card animate-[rise-in_450ms_cubic-bezier(0.2,0.7,0.2,1)_both]"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 text-sm">
        <div>
          <p className="font-semibold text-fg">Order # {orderId}</p>
          <p className="text-xs text-fg-muted">
            Sold {formatDeliveryDate(first.placedAt)} &middot; {first.speed === "fast" ? "Fast" : "Standard"} delivery, promised by {formatDeliveryDate(first.deliveryDate)}
          </p>
        </div>
        <p className="flex max-w-xs items-start gap-1.5 text-xs text-fg">
          <MapPin size={14} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden="true" />
          <span>
            <span className="font-semibold">{address.fullName}</span>, {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.zip}
          </span>
        </p>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => {
          const status = statusOf(item);
          return (
            <li key={item.asin} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <Link href={productHref(item.asin)} className="flex min-w-0 flex-1 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg border border-border bg-white object-contain" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm text-fg hover:text-accent">{item.title}</p>
                  <p className="text-xs text-fg-muted">
                    Qty {item.quantity} &middot; <span className="font-semibold text-fg">{formatPrice(item.cents)}</span>
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <div className="text-right">
                  <OrderStatusBadge status={status} />
                  {item.shippedAt && (
                    <p className="mt-1 text-[11px] text-fg-muted">
                      {item.deliveredAt ? `Delivered ${TIME.format(item.deliveredAt)}` : `Shipped ${TIME.format(item.shippedAt)}`}
                    </p>
                  )}
                </div>
                {status === ORDER_STATUS.ordered && <FulfilmentButton orderId={orderId} asin={item.asin} step={FULFILMENT_STEP.shipped} />}
                {status === ORDER_STATUS.shipped && <FulfilmentButton orderId={orderId} asin={item.asin} step={FULFILMENT_STEP.delivered} />}
              </div>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
