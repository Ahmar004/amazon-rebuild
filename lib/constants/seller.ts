// Seller orders vocabulary (frontend-rebuild.md point 15, D3).
export const SELLER_ORDER_TABS = [
  { id: "to-ship", label: "To ship" },
  { id: "shipped", label: "On the way" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;
export type SellerOrderTab = (typeof SELLER_ORDER_TABS)[number]["id"];
export const DEFAULT_SELLER_ORDER_TAB: SellerOrderTab = "to-ship";

export const FULFILMENT_STEP = { shipped: "shipped", delivered: "delivered" } as const;
export type FulfilmentStep = (typeof FULFILMENT_STEP)[keyof typeof FULFILMENT_STEP];
