import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CreditCard, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getOrder } from "@/lib/data/orders";
import { canCancel, orderStatus, orderTimeline } from "@/lib/orders/status";
import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/lib/constants/orders";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { productHref, ROUTES } from "@/lib/constants/links";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

type OrderPageProps = { params: Promise<{ id: string }> };

// Order details (C16): the status timeline, Cancel while it hasn't shipped, the items with Buy it
// again, and where it's going and how it was paid. getOrder is ownership-checked, so another
// shopper's order id is a 404. Reads the session, so it renders inside <Suspense>.
export default function OrderPage({ params }: OrderPageProps) {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: OrderPageProps) {
  const { id } = await params;
  const user = await requireUser(`${ROUTES.orders}/${encodeURIComponent(id)}`);
  const order = await getOrder(user.id, decodeURIComponent(id));
  if (!order) notFound();

  const now = new Date();
  const status = orderStatus(order, now);
  const delivered = status === ORDER_STATUS.delivered;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <Link href={ROUTES.orders} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
        <ChevronLeft size={16} aria-hidden="true" />
        Your Orders
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg">Order details</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Placed {formatDeliveryDate(order.placedAt)} &middot; Order # {order.id}
          </p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <section className="mt-5 rounded-xl border border-border bg-surface p-5 shadow-card" aria-label="Delivery progress">
        <p className="mb-4 text-lg font-bold text-fg">
          {status === ORDER_STATUS.cancelled
            ? "This order was cancelled and refunded"
            : delivered
              ? `Delivered ${formatDeliveryDate(order.deliveryDate)}`
              : `Arriving ${formatDeliveryDate(order.deliveryDate)}`}
        </p>
        <OrderTimeline steps={orderTimeline(order, now)} />
        {canCancel(order, now) && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <CancelOrderButton orderId={order.id} />
            <p className="text-xs text-fg-muted">You can cancel until the order ships, about an hour after you place it.</p>
          </div>
        )}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card" aria-label="Items">
          <h2 className="text-lg font-bold text-fg">Items</h2>
          <ul className="mt-2 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.asin} className="flex gap-4 py-4">
                <Link href={productHref(item.asin)} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={productHref(item.asin)} className="line-clamp-2 text-sm text-fg hover:text-accent">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-fg-muted">
                    Qty {item.quantity} &middot; {formatPrice(item.unitPriceCents)} each
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <AddToCartButton asin={item.asin} label="Buy it again" />
                    {delivered && (
                      <Link href={`${productHref(item.asin)}#reviews`} className="text-sm text-accent hover:underline">
                        Write a review
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-5 text-sm text-fg shadow-card" aria-label="Delivery and payment">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin size={16} aria-hidden="true" /> Delivering to
            </h2>
            <p className="mt-1">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.state} {order.address.zip}
            </p>
            <h2 className="mt-4 flex items-center gap-2 font-bold">
              <CreditCard size={16} aria-hidden="true" /> Payment
            </h2>
            <p className="mt-1">
              <span className="capitalize">{order.paymentBrand}</span> ending in {order.paymentLast4}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 text-sm text-fg shadow-card" aria-label="Order summary">
            <h2 className="font-bold">Order summary</h2>
            <dl className="mt-2 space-y-1">
              <SummaryRow label="Items" value={formatPrice(order.itemsCents)} />
              <SummaryRow label={`Shipping (${order.speed === "fast" ? "fast" : "standard"})`} value={order.shippingCents === 0 ? "FREE" : formatPrice(order.shippingCents)} />
              <SummaryRow label="Tax" value={formatPrice(order.taxCents)} />
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
            {status === ORDER_STATUS.cancelled && (
              <p className="mt-2 text-xs text-fg-muted">
                {ORDER_STATUS_LABEL.cancelled} - refunded {formatPrice(order.totalCents)} to your card.
              </p>
            )}
          </section>

          <p className="text-xs text-fg-muted">
            Something wrong with this order?{" "}
            <Link href={ROUTES.customerService} className="text-accent hover:underline">
              Contact Customer Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-fg-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-4 px-4 py-6" aria-hidden="true">
      <div className="h-8 w-56 animate-pulse rounded bg-surface" />
      <div className="h-40 animate-pulse rounded-xl bg-surface" />
      <div className="h-64 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}
