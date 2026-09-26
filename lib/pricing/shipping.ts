export type DeliverySpeed = "standard" | "fast";

export const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
export const STANDARD_FEE_CENTS = 699;
export const FAST_FEE_CENTS = 999;

export function shippingCents(itemsCents: number, speed: DeliverySpeed): number {
  if (speed === "fast") return FAST_FEE_CENTS;
  return itemsCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_FEE_CENTS;
}

export type FreeShippingProgress = {
  thresholdCents: number;
  remainingCents: number;
  /** 0-100, rounded down so the bar only reads full once the cart really qualifies. */
  percent: number;
  qualified: boolean;
};

// The "You're $X away from free shipping" bar (frontend-rebuild.md C8), worked out on the server
// from the cart subtotal so the client only displays it.
export function freeShippingProgress(subtotalCents: number): FreeShippingProgress {
  const remainingCents = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  return {
    thresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
    remainingCents,
    percent: Math.min(100, Math.floor((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100)),
    qualified: remainingCents === 0,
  };
}
