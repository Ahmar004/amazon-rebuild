"use server";

// Browsing history Server Actions. The user always comes from the session.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { clearHistory, recordView, removeFromHistory } from "@/lib/data/history";
import { asinSchema } from "@/lib/validation/cart";
import { ROUTES } from "@/lib/constants/links";

type HistoryResult = { ok: true } | { ok: false; error: string };

const SIGNED_OUT: HistoryResult = { ok: false, error: "Please sign in to manage your browsing history." };

// Called by the product page after it renders. History is a nice-to-have, so a failure is
// swallowed rather than surfaced to the shopper.
export async function recordProductView(asin: string): Promise<void> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return;
  const user = await getCurrentUser();
  if (!user) return;
  try {
    await recordView(user.id, parsed.data);
  } catch {
    // Ignored on purpose (see above).
  }
}

export async function removeHistoryItem(asin: string): Promise<HistoryResult> {
  const parsed = asinSchema.safeParse(asin);
  if (!parsed.success) return { ok: false, error: "Could not remove that item." };
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  await removeFromHistory(user.id, parsed.data);
  revalidatePath(ROUTES.history);
  return { ok: true };
}

export async function clearBrowsingHistory(): Promise<HistoryResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  await clearHistory(user.id);
  revalidatePath(ROUTES.history);
  return { ok: true };
}
