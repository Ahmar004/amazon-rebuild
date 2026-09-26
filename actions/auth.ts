"use server";

// Server Actions behind sign-in, create-account and sign-out. Called from
// client components via onSubmit + preventDefault (CLAUDE.md forms rule), the same pattern as
// actions/cart.ts and LocationModal: return a result object on failure, redirect() on success.
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { safeReturnTo } from "@/lib/auth/return-to";
import { findUserByEmail, createUser } from "@/lib/data/users";
import { mergeGuestCart } from "@/lib/data/cart";
import { CART_TOKEN_COOKIE, getGuestToken } from "@/lib/auth/guest";
import { AUTH_ERRORS, fieldErrorsOf, registerSchema, signInSchema } from "@/lib/validation/auth";
import { ROUTES } from "@/lib/constants/links";

// A failed sign-in or create-account: one message for the whole form and/or one per field.
export type AuthResult = { ok: false; error?: string; fieldErrors?: Record<string, string> };

// After createSession, folds any guest cart into the new session and clears the now-owned
// cart_token cookie (docs/design.md 6.6: "mergeGuestCart(guestToken, userId) ... then clear
// the guest cookies"). Browsing-history merge and the default list are later slices' work.
async function finishSignIn(userId: string): Promise<void> {
  const guestToken = await getGuestToken();
  await createSession(userId);

  if (guestToken) {
    await mergeGuestCart(guestToken, userId);
    const store = await cookies();
    store.delete(CART_TOKEN_COOKIE);
  }

  revalidatePath("/", "layout");
}

// Sign in with email and password on one screen (frontend-rebuild.md C11). A wrong password and
// an unknown email show the same message, so a guess never confirms whether an account exists.
export async function signIn(input: { email: string; password: string; returnTo: string }): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  const user = await findUserByEmail(parsed.data.email);
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { ok: false, error: AUTH_ERRORS.credentialsInvalid };

  await finishSignIn(user.id);
  redirect(safeReturnTo(input.returnTo));
}

// Creates the account and signs it in. The email is checked for uniqueness before insert.
export async function register(input: { name: string; email: string; password: string; returnTo: string }): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsOf(parsed.error) };

  if (await findUserByEmail(parsed.data.email)) return { ok: false, fieldErrors: { email: AUTH_ERRORS.emailTaken } };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await createUser({ name: parsed.data.name, email: parsed.data.email, passwordHash });

  await finishSignIn(user.id);
  redirect(safeReturnTo(input.returnTo));
}

export async function signOut(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect(ROUTES.signIn);
}
