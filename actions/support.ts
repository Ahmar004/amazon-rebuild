"use server";

// Customer Service "Contact us" (frontend-rebuild.md C18). Requests are saved under the signed-in
// user; a linked order must be one of theirs.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { closeSupportRequest, createSupportRequest, userOwnsOrder } from "@/lib/data/support";
import { supportRequestSchema } from "@/lib/validation/support";
import { idSchema } from "@/lib/validation/account";
import { fieldErrorsOf } from "@/lib/validation/auth";
import { SUPPORT_ERRORS } from "@/lib/constants/support";
import { ROUTES } from "@/lib/constants/links";

export type SupportResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const SIGNED_OUT: SupportResult = { ok: false, error: "Please sign in again." };
const GENERIC_ERROR: SupportResult = { ok: false, error: "We couldn't send that. Please try again." };

export async function submitSupportRequest(input: {
  topic: string;
  orderId?: string | null;
  subject: string;
  message: string;
}): Promise<SupportResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const parsed = supportRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const { orderId, ...rest } = parsed.data;
  if (orderId && !(await userOwnsOrder(user.id, orderId))) {
    return { ok: false, fieldErrors: { orderId: SUPPORT_ERRORS.orderNotFound } };
  }

  try {
    await createSupportRequest(user.id, { ...rest, orderId });
  } catch {
    return GENERIC_ERROR;
  }
  revalidatePath(ROUTES.customerService);
  return { ok: true };
}

export async function closeRequest(id: string): Promise<SupportResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return GENERIC_ERROR;
  await closeSupportRequest(user.id, parsed.data);
  revalidatePath(ROUTES.customerService);
  return { ok: true };
}
