import { ORDER_STATUS, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/constants/orders";

const TONE: Record<OrderStatus, string> = {
  [ORDER_STATUS.ordered]: "bg-accent-soft text-accent",
  [ORDER_STATUS.shipped]: "bg-accent-soft text-accent",
  [ORDER_STATUS.outForDelivery]: "bg-accent-soft text-accent",
  [ORDER_STATUS.delivered]: "bg-success/15 text-success",
  [ORDER_STATUS.cancelled]: "bg-danger/10 text-danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${TONE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>
  );
}
