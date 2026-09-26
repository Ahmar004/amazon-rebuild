import { Suspense } from "react";
import { requireUser } from "@/lib/auth/current-user";
import { getOrdersForUser } from "@/lib/data/orders";
import { OrdersList } from "@/components/orders/OrdersList";
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
      <p className="text-xs text-fg-muted">
        Your Account {"›"} <span className="text-fg">Your Orders</span>
      </p>
      <div className="mt-2">
        <OrdersList orders={orders} />
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-6" aria-hidden="true">
      <div className="h-8 w-40 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-[200px] animate-pulse rounded-lg bg-surface" />
    </div>
  );
}
