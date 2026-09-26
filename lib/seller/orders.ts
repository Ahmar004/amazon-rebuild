// Pure helpers for Seller orders (D3): which tab a sold item belongs in, and grouping sold items
// by the order they were bought in.
import { DEFAULT_SELLER_ORDER_TAB, SELLER_ORDER_TABS, type SellerOrderTab } from "@/lib/constants/seller";

type Fulfilment = { cancelledAt: Date | null; shippedAt: Date | null; deliveredAt: Date | null };

export function sellerItemTab(item: Fulfilment): SellerOrderTab {
  if (item.cancelledAt) return "cancelled";
  if (item.deliveredAt) return "delivered";
  if (item.shippedAt) return "shipped";
  return "to-ship";
}

export function parseSellerOrderTab(value: string | undefined): SellerOrderTab {
  return SELLER_ORDER_TABS.find((tab) => tab.id === value)?.id ?? DEFAULT_SELLER_ORDER_TAB;
}

export function groupSellerOrders<T extends { orderId: string }>(rows: T[]): { orderId: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) groups.set(row.orderId, [...(groups.get(row.orderId) ?? []), row]);
  return Array.from(groups, ([orderId, items]) => ({ orderId, items }));
}
