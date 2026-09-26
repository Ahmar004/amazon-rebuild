// Input schemas and the identify-step parser for actions/auth.ts (docs/design.md 6.6). Every
// user-facing message here is the exact wording from docs/design.md so
// TDD can assert on the exact string the UI shows.
import { z } from "zod";

// The phone-detection heuristic for the identify step (docs/superpowers/plans/
// 2026-09-19-slice-6-auth.md): digits, spaces, parens and hyphens, optionally +-prefixed, 7+ chars.
export const PHONE_PATTERN = /^\+?[\d\s()-]{7,}$/;

export const AUTH_ERRORS = {
  identifierEmpty: "Enter your mobile number or email",
  identifierPhone: "We cannot find an account with that mobile number",
  identifierInvalid: "Enter a valid email address or mobile number",
  passwordIncorrect: "Your password is incorrect",
  nameRequired: "Enter your name",
  passwordTooShort: "Minimum 6 characters required",
  passwordMismatch: "Passwords must match",
  emailTaken: "There's already an account with this email",
} as const;

const emailSchema = z.string().trim().toLowerCase().email(AUTH_ERRORS.identifierInvalid);

export type ParseIdentifierResult = { ok: true; email: string } | { ok: false; error: string };

// Step 1 of the sign-in flow: lowercases and trims, then routes to the phone message or the
// email-format message before ever hitting the database (docs/design.md 6.6).
export function parseIdentifier(raw: string): ParseIdentifierResult {
  const value = raw.trim().toLowerCase();
  if (!value) return { ok: false, error: AUTH_ERRORS.identifierEmpty };
  if (PHONE_PATTERN.test(value)) return { ok: false, error: AUTH_ERRORS.identifierPhone };

  const result = emailSchema.safeParse(value);
  if (!result.success) return { ok: false, error: AUTH_ERRORS.identifierInvalid };
  return { ok: true, email: result.data };
}

export const signInPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export type SignInPasswordInput = z.infer<typeof signInPasswordSchema>;

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(1, AUTH_ERRORS.nameRequired),
    password: z.string().min(6, AUTH_ERRORS.passwordTooShort),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: AUTH_ERRORS.passwordMismatch,
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;
