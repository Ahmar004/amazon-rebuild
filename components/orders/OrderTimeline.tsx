import { Check, CircleX, House, Package, ShoppingBag, Truck } from "lucide-react";
import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/constants/orders";
import type { TimelineStep } from "@/lib/orders/status";

const ICONS: Record<OrderStatus, typeof Check> = {
  ordered: ShoppingBag,
  shipped: Package,
  out_for_delivery: Truck,
  delivered: House,
  cancelled: CircleX,
};

const DAY = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

// Ordered > Shipped > Out for delivery > Delivered (C16), worked out by orderTimeline from the
// order's age, or Ordered > Shipped > Delivered when a user sells an item (D3). Steps not reached
// yet show their expected date, or that they wait on the seller. Horizontal from 640px, a vertical
// list on phones.
export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-0">
      {steps.map((step, index) => {
        const Icon = step.reached && !step.current ? Check : ICONS[step.status];
        const cancelled = step.status === ORDER_STATUS.cancelled;
        const tone = cancelled ? "bg-danger text-white" : step.reached ? "bg-accent text-accent-fg" : "bg-surface-muted text-fg-muted";
        return (
          <li key={step.status} className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:text-center" aria-current={step.current ? "step" : undefined}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-4 hidden h-1 rounded-full sm:block ${step.reached ? "bg-accent" : "bg-surface-muted"}`}
                style={{ left: "calc(-50% + 1.5rem)", width: "calc(100% - 3rem)" }}
              />
            )}
            <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone} ${step.current ? "ring-4 ring-accent-soft" : ""}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
            <span>
              <span className={`block text-sm ${step.current ? "font-bold text-fg" : step.reached ? "text-fg" : "text-fg-muted"}`}>
                {ORDER_STATUS_LABEL[step.status]}
              </span>
              <span className="block text-xs text-fg-muted">
                {step.at === null ? "Waiting for the seller" : step.reached ? DAY.format(step.at) : `Expected ${DAY.format(step.at)}`}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
