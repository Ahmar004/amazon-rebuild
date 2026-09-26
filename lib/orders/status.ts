// The order status timeline (docs/spec.md 6.4, frontend-rebuild.md C16, D3). Pure functions of the
// order's dates and "now" in UTC, so nothing runs in the background and tests pin the clock.
// Items Shopeedo sells move along with the order's age; items a user sells move only when their
// seller marks them shipped and delivered. An order is as far along as its least advanced item.
import { DELIVERED_HOUR_UTC, ORDER_STATUS, SHIP_AFTER_MS, type OrderStatus } from "@/lib/constants/orders";

/** How far one order item has got. sellerId is null for items Shopeedo sells. */
export type ItemFulfilment = { sellerId: string | null; shippedAt: Date | null; deliveredAt: Date | null };

export type OrderDates = { placedAt: Date; deliveryDate: Date; cancelledAt: Date | null; items?: ItemFulfilment[] };

/** `at` is null for a step that waits on a seller, so it has no expected date. */
export type TimelineStep = { status: OrderStatus; at: Date | null; reached: boolean; current: boolean };

const RANK: OrderStatus[] = [ORDER_STATUS.ordered, ORDER_STATUS.shipped, ORDER_STATUS.outForDelivery, ORDER_STATUS.delivered];

function milestones(order: OrderDates): { status: OrderStatus; at: Date }[] {
  const deliveryDay = Date.UTC(order.deliveryDate.getUTCFullYear(), order.deliveryDate.getUTCMonth(), order.deliveryDate.getUTCDate());
  return [
    { status: ORDER_STATUS.ordered, at: order.placedAt },
    { status: ORDER_STATUS.shipped, at: new Date(order.placedAt.getTime() + SHIP_AFTER_MS) },
    { status: ORDER_STATUS.outForDelivery, at: new Date(deliveryDay) },
    { status: ORDER_STATUS.delivered, at: new Date(deliveryDay + DELIVERED_HOUR_UTC * 60 * 60 * 1000) },
  ];
}

function timedStatus(order: OrderDates, now: Date): OrderStatus {
  let status: OrderStatus = ORDER_STATUS.ordered;
  for (const step of milestones(order)) if (now >= step.at) status = step.status;
  return status;
}

function sellerItems(order: OrderDates): ItemFulfilment[] {
  return (order.items ?? []).filter((item) => item.sellerId !== null);
}

export function itemStatus(order: OrderDates, item: ItemFulfilment, now: Date): OrderStatus {
  if (order.cancelledAt) return ORDER_STATUS.cancelled;
  if (item.sellerId === null) return timedStatus(order, now);
  if (item.deliveredAt) return ORDER_STATUS.delivered;
  if (item.shippedAt) return ORDER_STATUS.shipped;
  return ORDER_STATUS.ordered;
}

export function orderStatus(order: OrderDates, now: Date): OrderStatus {
  if (order.cancelledAt) return ORDER_STATUS.cancelled;
  if (sellerItems(order).length === 0) return timedStatus(order, now);
  const ranks = order.items!.map((item) => RANK.indexOf(itemStatus(order, item, now)));
  return RANK[Math.min(...ranks)];
}

// Cancel covers the whole order, so it stays open only while no item has shipped.
export function canCancel(order: OrderDates, now: Date): boolean {
  if (order.cancelledAt) return false;
  const items = order.items?.length ? order.items : [{ sellerId: null, shippedAt: null, deliveredAt: null }];
  return items.every((item) => itemStatus(order, item, now) === ORDER_STATUS.ordered);
}

export function orderTimeline(order: OrderDates, now: Date): TimelineStep[] {
  if (order.cancelledAt) {
    return [
      { status: ORDER_STATUS.ordered, at: order.placedAt, reached: true, current: false },
      { status: ORDER_STATUS.cancelled, at: order.cancelledAt, reached: true, current: true },
    ];
  }
  const current = orderStatus(order, now);
  if (sellerItems(order).length === 0) {
    return milestones(order).map((step) => ({ ...step, reached: now >= step.at, current: step.status === current }));
  }

  // Sellers don't report "out for delivery", so these orders go Ordered > Shipped > Delivered. A
  // step is reached once every item has reached it, dated by the last item to get there.
  const timed = milestones(order);
  const dateOf = (item: ItemFulfilment, status: OrderStatus): Date | null => {
    if (item.sellerId === null) return timed.find((step) => step.status === status)!.at;
    return status === ORDER_STATUS.shipped ? item.shippedAt : item.deliveredAt;
  };
  const steps = [ORDER_STATUS.shipped, ORDER_STATUS.delivered].map((status) => {
    const dates = order.items!.map((item) => dateOf(item, status));
    const known = dates.every((date): date is Date => date !== null);
    const at = known ? new Date(Math.max(...dates.map((date) => date.getTime()))) : null;
    const reached = order.items!.every((item) => RANK.indexOf(itemStatus(order, item, now)) >= RANK.indexOf(status));
    // A catalogue item out for delivery still reads as Shipped on this shorter timeline.
    const isCurrent = status === current || (status === ORDER_STATUS.shipped && current === ORDER_STATUS.outForDelivery);
    return { status, at, reached, current: isCurrent };
  });
  return [{ status: ORDER_STATUS.ordered, at: order.placedAt, reached: true, current: current === ORDER_STATUS.ordered }, ...steps];
}
