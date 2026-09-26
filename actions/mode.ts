"use server";

// The Buying / Selling switch (frontend-rebuild.md D4): remembers the mode and opens that mode's
// front page. It's a plain form action, so the switch works before any JavaScript loads.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MODE_COOKIE, MODE_COOKIE_MAX_AGE, parseMode, SHOP_MODE } from "@/lib/constants/mode";
import { ROUTES } from "@/lib/constants/links";

export async function switchMode(formData: FormData): Promise<void> {
  const mode = parseMode(String(formData.get("mode") ?? ""));
  (await cookies()).set(MODE_COOKIE, mode, { path: "/", httpOnly: true, sameSite: "lax", maxAge: MODE_COOKIE_MAX_AGE });
  redirect(mode === SHOP_MODE.selling ? ROUTES.sellerDashboard : ROUTES.home);
}
