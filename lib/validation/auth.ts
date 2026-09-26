// Input schemas for actions/auth.ts. Sign-in and create-account are each one screen
// (frontend-rebuild.md C11), so every field is validated together and errors are reported per
// field. Messages live here so tests can assert on the exact string the UI shows.
import { z } from "zod";

export const AUTH_ERRORS = {
  emailInvalid: "Enter a valid email address",
  passwordRequired: "Enter your password",
  credentialsInvalid: "Your email or password is incorrect",
  nameRequired: "Enter your name",
  passwordTooShort: "Use at least 6 characters",
  emailTaken: "There's already an account with this email. Sign in instead.",
} as const;

const email = z.string().trim().toLowerCase().email(AUTH_ERRORS.emailInvalid);

export const signInSchema = z.object({
  email,
  password: z.string().min(1, AUTH_ERRORS.passwordRequired),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, AUTH_ERRORS.nameRequired),
  email,
  password: z.string().min(6, AUTH_ERRORS.passwordTooShort),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// The first message for each field, keyed by field name.
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
