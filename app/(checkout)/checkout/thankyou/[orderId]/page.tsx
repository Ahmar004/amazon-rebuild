import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getOrder } from "@/lib/data/orders";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";

// The order confirmation page (docs/spec.md 5.8, docs/superpowers plan): "Order placed, thank
// you!", the delivery date, the shipping address and item thumbnails, and links to "Your Orders"
// and "Continue shopping". Ownership-checked - getOrder only returns an order for this user.
// requireUser reads cookies() and the route reads a dynamic params, so both must render inside
// <Suspense>, never under 'use cache' (CLAUDE.md's Next.js 16 caching rule).
export default function ThankYouPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <Suspense fallback={<ThankYouSkeleton />}>
      <ThankYouContent params={params} />
    </Suspense>
  );
}

async function ThankYouContent({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requireUser(`${ROUTES.checkout}/thankyou/${orderId}`);

  const order = await getOrder(user.id, orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-[700px] px-4 py-8">
      <div className="rounded-lg bg-surface p-6">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-success">
            <circle cx="12" cy="12" r="11" fill="currentColor" />
            <path d="M7 12.5 L10.5 16 L17 8.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-2xl font-bold text-fg">Order placed, thank you!</h1>
        </div>

        <p className="mt-2 text-sm text-fg">Your order has been placed.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase text-fg-muted">Order date</p>
            <p className="text-sm text-fg">{formatDeliveryDate(order.placedAt)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-fg-muted">Estimated delivery</p>
            <p className="text-sm text-fg">{formatDeliveryDate(order.deliveryDate)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-fg-muted">Order total</p>
            <p className="text-sm text-fg">{formatPrice(order.totalCents)}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-bold uppercase text-fg-muted">Delivering to</p>
          <p className="mt-1 text-sm text-fg">
            <span className="font-bold">{order.address.fullName}</span>
            <br />
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}
            <br />
            {order.address.city}, {order.address.state} {order.address.zip}
          </p>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-bold uppercase text-fg-muted">Order # {order.id}</p>
          <ul className="mt-2 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.asin} className="flex items-center gap-3 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-fg">{item.title}</p>
                  <p className="text-sm text-fg-muted">Qty: {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:gap-4">
          <Link
            href={`${ROUTES.orders}/${order.id}`}
            className="rounded-full border border-accent bg-accent px-4 py-2 text-center text-sm font-bold text-accent-fg hover:bg-accent-hover"
          >
            View order details
          </Link>
          <Link
            href={ROUTES.home}
            className="rounded-full border border-border bg-surface px-4 py-2 text-center text-sm text-fg hover:bg-surface-muted"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function ThankYouSkeleton() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-8" aria-hidden="true">
      <div className="h-[500px] animate-pulse rounded-lg bg-surface" />
    </div>
  );
}
