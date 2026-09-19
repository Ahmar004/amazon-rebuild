// Server-only read of the visitor's delivery location. Split from lib/location.ts so that
// module (pure, DOM/Next-free, used in tests) doesn't import next/headers. Later slices call
// this for delivery dates (docs/design.md).
import { cookies } from "next/headers";
import { LOCATION_COOKIE, parseLocationCookie, type DeliveryLocation } from "@/lib/location";

export async function getDeliveryLocation(): Promise<DeliveryLocation> {
  const store = await cookies();
  return parseLocationCookie(store.get(LOCATION_COOKIE)?.value);
}
