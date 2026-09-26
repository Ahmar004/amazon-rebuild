import type { DeliverySpeed } from "@/lib/pricing/shipping";

export const STANDARD_DAYS = 5;
export const FAST_DAYS = 2;

export function deliveryDate(from: Date, speed: DeliverySpeed): Date {
  const days = speed === "fast" ? FAST_DAYS : STANDARD_DAYS;
  const result = new Date(from.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

const FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDeliveryDate(d: Date): string {
  return FORMATTER.format(d).replace(",", ",");
}
