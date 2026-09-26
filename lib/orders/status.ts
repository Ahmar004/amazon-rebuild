// The order status timeline (docs/spec.md 6.4, frontend-rebuild.md C16). Pure functions of the
// order's dates and "now" in UTC, so nothing runs in the background and tests pin the clock.
import { DELIVERED_HOUR_UTC, ORDER_STATUS, SHIP_AFTER_MS, type OrderStatus } from "@/lib/constants/orders";

export type OrderDates = { placedAt: Date; deliveryDate: Date; cancelledAt: Date | null };

export type TimelineStep = { status: OrderStatus; at: Date; reached: boolean; current: boolean };

function milestones(order: OrderDates): { status: OrderStatus; at: Date }[] {
  const deliveryDay = Date.UTC(order.deliveryDate.getUTCFullYear(), order.deliveryDate.getUTCMonth(), order.deliveryDate.getUTCDate());
  return [
    { status: ORDER_STATUS.ordered, at: order.placedAt },
    { status: ORDER_STATUS.shipped, at: new Date(order.placedAt.getTime() + SHIP_AFTER_MS) },
    { status: ORDER_STATUS.outForDelivery, at: new Date(deliveryDay) },
    { status: ORDER_STATUS.delivered, at: new Date(deliveryDay + DELIVERED_HOUR_UTC * 60 * 60 * 1000) },
  ];
}

export function orderStatus(order: OrderDates, now: Date): OrderStatus {
  if (order.cancelledAt) return ORDER_STATUS.cancelled;
  let status: OrderStatus = ORDER_STATUS.ordered;
  for (const step of milestones(order)) if (now >= step.at) status = step.status;
  return status;
}

export function canCancel(order: OrderDates, now: Date): boolean {
  return orderStatus(order, now) === ORDER_STATUS.ordered;
}

export function orderTimeline(order: OrderDates, now: Date): TimelineStep[] {
  if (order.cancelledAt) {
    return [
      { status: ORDER_STATUS.ordered, at: order.placedAt, reached: true, current: false },
      { status: ORDER_STATUS.cancelled, at: order.cancelledAt, reached: true, current: true },
    ];
  }
  const current = orderStatus(order, now);
  return milestones(order).map((step) => ({ ...step, reached: now >= step.at, current: step.status === current }));
}
