"use server";

// Server Actions behind sign-in, create-account and sign-out (docs/design.md 6.6). Called from
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
import { AUTH_ERRORS, parseIdentifier, registerSchema, signInPasswordSchema } from "@/lib/validation/auth";
import { ROUTES } from "@/lib/constants/links";

const GENERIC_ERROR = "Something went wrong. Please try again.";

type IdentifyResult = { ok: false; error: string } | { ok: true; redirectTo: string };
type ActionResult = { ok: false; error: string } | { ok: true };
type RegisterResult = { ok: false; error: string; fieldErrors?: Record<string, string> } | { ok: true };

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

// Step 1: identifies whether the email is known (-> password step) or not (-> register),
// carrying the email and a validated return_to along. Never reveals which without the visitor
// first passing basic format checks (CLAUDE.md: "Error messages never reveal more than
// Amazon's do").
export async function identify(input: { identifier: string; returnTo: string }): Promise<IdentifyResult> {
  const parsed = parseIdentifier(input.identifier);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const returnTo = safeReturnTo(input.returnTo);
  const qs = `email=${encodeURIComponent(parsed.email)}&return_to=${encodeURIComponent(returnTo)}`;

  const user = await findUserByEmail(parsed.email);
  return { ok: true, redirectTo: user ? `${ROUTES.signIn}/password?${qs}` : `${ROUTES.register}?${qs}` };
}

// Step 2 (known email): a wrong password or an unknown user both show the same generic message,
// so a bad guess never confirms whether the account exists (docs/design.md 6.6).
export async function signIn(input: { email: string; password: string; returnTo: string }): Promise<ActionResult> {
  const parsed = signInPasswordSchema.safeParse({ email: input.email, password: input.password });
  if (!parsed.success) return { ok: false, error: AUTH_ERRORS.passwordIncorrect };

  const user = await findUserByEmail(parsed.data.email);
  if (!user) return { ok: false, error: AUTH_ERRORS.passwordIncorrect };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { ok: false, error: AUTH_ERRORS.passwordIncorrect };

  await finishSignIn(user.id);
  redirect(safeReturnTo(input.returnTo));
}

// Step 2 (unknown email): creates the account. The email is re-checked for uniqueness here too
// (a race with another tab registering the same email between steps 1 and 2 is still caught).
export async function register(input: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  returnTo: string;
}): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: GENERIC_ERROR, fieldErrors };
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) return { ok: false, error: AUTH_ERRORS.emailTaken };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await createUser({ name: parsed.data.name, email: parsed.data.email, passwordHash });

  await finishSignIn(user.id);
  redirect(safeReturnTo(input.returnTo));
}

export async function signOut(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect(ROUTES.home);
}
