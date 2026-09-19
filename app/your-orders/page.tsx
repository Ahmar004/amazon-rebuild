import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getOrdersForUser } from "@/lib/data/orders";
import { formatDeliveryDate } from "@/lib/pricing/delivery";
import { formatPrice } from "@/lib/pricing/money";
import { ROUTES } from "@/lib/constants/links";

// Your Orders list (docs/spec.md 5.8): every order the signed-in user has placed, newest first,
// with a link into each order's detail. requireUser reads cookies(), so this route renders inside
// <Suspense> rather than under 'use cache' (CLAUDE.md's Next.js 16 caching rule).
export default function YourOrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const user = await requireUser(ROUTES.orders);
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <h1 className="text-2xl font-bold text-text">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-6 text-center">
          <p className="text-sm text-text">You have no orders yet.</p>
          <Link
            href={ROUTES.home}
            className="mt-3 inline-block rounded-full border border-btn-yellow-border bg-btn-yellow px-4 py-2 text-sm font-bold text-text hover:bg-btn-yellow-hover"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-border bg-white">
              <div className="grid grid-cols-2 gap-4 border-b border-border bg-modal-header px-4 py-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-bold uppercase text-text-muted">Order placed</p>
                  <p className="text-sm text-text">{formatDeliveryDate(order.placedAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-text-muted">Total</p>
                  <p className="text-sm text-text">{formatPrice(order.totalCents)}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs font-bold uppercase text-text-muted">Delivering to</p>
                  <p className="text-sm text-text">{order.address.fullName}</p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-xs font-bold uppercase text-text-muted">Order # {order.id}</p>
                  <Link href={`${ROUTES.checkout}/thankyou/${order.id}`} className="text-sm text-link hover:text-link-hover hover:underline">
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
                      <p className="line-clamp-2 text-sm text-text">{item.title}</p>
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
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

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6" aria-hidden="true">
      <div className="h-8 w-40 animate-pulse rounded bg-white" />
      <div className="mt-4 h-[200px] animate-pulse rounded-lg bg-white" />
    </div>
  );
}
