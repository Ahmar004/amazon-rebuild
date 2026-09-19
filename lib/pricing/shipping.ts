export type DeliverySpeed = "standard" | "fast";

export const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
export const STANDARD_FEE_CENTS = 699;
export const FAST_FEE_CENTS = 999;

export function shippingCents(itemsCents: number, speed: DeliverySpeed): number {
  if (speed === "fast") return FAST_FEE_CENTS;
  return itemsCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_FEE_CENTS;
}
