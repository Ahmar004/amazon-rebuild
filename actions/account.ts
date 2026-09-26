"use server";

// Server Actions behind /account (frontend-rebuild.md C15): profile, password, addresses and saved
// cards. Every write is scoped to the signed-in user's id from the session, never a client value.
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { findUserByEmail, getPasswordHash, setPasswordHash, updateProfile as saveProfile } from "@/lib/data/users";
import { deleteAddress, setDefaultAddress } from "@/lib/data/addresses";
import { getPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } from "@/lib/data/payments";
import { stripe } from "@/lib/stripe";
import { fieldErrorsOf } from "@/lib/validation/auth";
import { ACCOUNT_ERRORS, idSchema, passwordChangeSchema, profileSchema } from "@/lib/validation/account";
import { ROUTES } from "@/lib/constants/links";

export type AccountResult = { ok: true } | { ok: false; error?: string; fieldErrors?: Record<string, string> };

const SIGNED_OUT: AccountResult = { ok: false, error: "Please sign in again." };
const GENERIC_ERROR: AccountResult = { ok: false, error: "Something went wrong. Please try again." };

function refresh() {
  revalidatePath(ROUTES.account);
}

export async function updateProfile(input: { name: string; email: string }): Promise<AccountResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const owner = await findUserByEmail(parsed.data.email);
  if (owner && owner.id !== user.id) return { ok: false, fieldErrors: { email: ACCOUNT_ERRORS.emailTaken } };

  try {
    await saveProfile(user.id, parsed.data);
  } catch {
    return GENERIC_ERROR;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<AccountResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;

  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const hash = await getPasswordHash(user.id);
  if (!hash || !(await verifyPassword(parsed.data.currentPassword, hash))) {
    return { ok: false, fieldErrors: { currentPassword: ACCOUNT_ERRORS.currentPasswordWrong } };
  }

  await setPasswordHash(user.id, await hashPassword(parsed.data.newPassword));
  return { ok: true };
}

// Runs one address or card write for the signed-in user after checking the id's shape.
async function ownedWrite(id: string, write: (userId: string, id: string) => Promise<void>): Promise<AccountResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return GENERIC_ERROR;
  try {
    await write(user.id, parsed.data);
  } catch {
    return GENERIC_ERROR;
  }
  refresh();
  return { ok: true };
}

export async function removeAddress(id: string): Promise<AccountResult> {
  return ownedWrite(id, deleteAddress);
}

export async function makeDefaultAddress(id: string): Promise<AccountResult> {
  return ownedWrite(id, setDefaultAddress);
}

// Removes the saved card here and detaches it from the shopper's Stripe customer, so it can't be
// charged again. A detach failure (already detached) doesn't block removing our copy.
export async function removeCard(id: string): Promise<AccountResult> {
  return ownedWrite(id, async (userId, cardId) => {
    const card = await getPaymentMethod(userId, cardId);
    if (card) await stripe.paymentMethods.detach(card.stripePaymentMethodId).catch(() => {});
    await removePaymentMethod(userId, cardId);
  });
}

export async function makeDefaultCard(id: string): Promise<AccountResult> {
  return ownedWrite(id, setDefaultPaymentMethod);
}
