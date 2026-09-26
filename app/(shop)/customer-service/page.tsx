import { Suspense } from "react";
import Link from "next/link";
import { LifeBuoy, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { getOrdersForUser } from "@/lib/data/orders";
import { listSupportRequests } from "@/lib/data/support";
import { canCancel, orderStatus } from "@/lib/orders/status";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { ROUTES } from "@/lib/constants/links";
import { buttonClass } from "@/components/ui/Button";
import { FaqBrowser } from "@/components/support/FaqBrowser";
import { ContactForm } from "@/components/support/ContactForm";
import { SupportRequestList } from "@/components/support/SupportRequestList";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { CancelOrderButton } from "@/components/orders/CancelOrderButton";

const RECENT_ORDERS = 3;

type CustomerServicePageProps = { searchParams: Promise<{ order?: string }> };

// Customer Service (point 11, C18): shortcuts for the shopper's latest orders first (most help
// requests are about one), then searchable help topics, then "Contact us" and the shopper's own
// requests. The FAQ is static; everything else reads the session, so it streams in <Suspense>.
export default function CustomerServicePage({ searchParams }: CustomerServicePageProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <LifeBuoy size={24} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-fg">Customer Service</h1>
          <p className="text-sm text-fg-muted">Find an answer, sort out an order, or send us a message.</p>
        </div>
      </div>

      <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-xl bg-surface" />}>
        <RecentOrders />
      </Suspense>

      <div className="mt-8">
        <FaqBrowser />
      </div>

      <section id="contact" aria-labelledby="contact-heading" className="mt-8 scroll-mt-24">
        <h2 id="contact-heading" className="flex items-center gap-2 text-xl font-bold text-fg">
          <MessageSquare size={20} aria-hidden="true" />
          Contact us
        </h2>
        <p className="mt-1 text-sm text-fg-muted">Couldn&apos;t find what you need? Tell us and it&apos;s saved to your requests below.</p>
        <Suspense fallback={<div className="mt-3 h-80 animate-pulse rounded-xl bg-surface" />}>
          <ContactSection searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

async function RecentOrders() {
  const user = await requireUser(ROUTES.customerService);
  const now = new Date();
  const orders = (await getOrdersForUser(user.id)).slice(0, RECENT_ORDERS);
  if (orders.length === 0) return null;

  return (
    <section aria-labelledby="recent-orders-heading" className="mt-6">
      <h2 id="recent-orders-heading" className="text-xl font-bold text-fg">
        Your recent orders
      </h2>
      <ul className="mt-3 grid gap-3 md:grid-cols-3">
        {orders.map((order) => (
          <li key={order.id} className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={order.items[0]?.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
              </span>
              <div className="min-w-0">
                <OrderStatusBadge status={orderStatus(order, now)} />
                <p className="mt-1 line-clamp-1 text-sm text-fg">{order.items[0]?.title}</p>
                <p className="text-xs text-fg-muted">Placed {formatDeliveryDate(order.placedAt)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
              <div className="flex gap-2">
                <Link href={`${ROUTES.orders}/${order.id}`} className={buttonClass({ variant: "secondary", size: "sm", className: "flex-1 rounded-full" })}>
                  Track
                </Link>
                <Link href={`${ROUTES.customerService}?order=${order.id}#contact`} className={buttonClass({ variant: "secondary", size: "sm", className: "flex-1 rounded-full" })}>
                  Get help
                </Link>
              </div>
              {canCancel(order, now) && <CancelOrderButton orderId={order.id} full />}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ContactSection({ searchParams }: CustomerServicePageProps) {
  const [{ order }, user] = await Promise.all([searchParams, requireUser(ROUTES.customerService)]);
  const [orders, requests] = await Promise.all([getOrdersForUser(user.id), listSupportRequests(user.id)]);
  const options = orders.map((o) => ({
    id: o.id,
    label: `${formatDeliveryDate(o.placedAt)} - ${o.items[0]?.title.slice(0, 40) ?? "Order"} (#${o.id})`,
  }));
  const defaultOrderId = options.some((o) => o.id === order) ? order : undefined;

  return (
    <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <ContactForm orders={options} defaultOrderId={defaultOrderId} />
      <div>
        <h3 className="mb-3 text-base font-bold text-fg">Your requests</h3>
        <SupportRequestList requests={requests} />
      </div>
    </div>
  );
}
