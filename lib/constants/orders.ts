// Order statuses (docs/spec.md 6.4). Status is worked out from the order's age, never stored.
export const ORDER_STATUS = {
  ordered: "ordered",
  shipped: "shipped",
  outForDelivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ordered: "Ordered",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Orders ship (and stop being cancellable) this long after they are placed. */
export const SHIP_AFTER_MS = 60 * 60 * 1000;
/** On the delivery date, the order counts as delivered from this UTC hour. */
export const DELIVERED_HOUR_UTC = 18;
