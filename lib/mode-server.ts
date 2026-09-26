// Reads the remembered Buying / Selling mode. Reads cookies(), so callers render inside <Suspense>.
import { cookies } from "next/headers";
import { MODE_COOKIE, parseMode, type ShopMode } from "@/lib/constants/mode";

export async function getShopMode(): Promise<ShopMode> {
  return parseMode((await cookies()).get(MODE_COOKIE)?.value);
}
