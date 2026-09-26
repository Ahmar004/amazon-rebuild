// Input schemas for actions/account.ts (frontend-rebuild.md C15). The field rules match
// registration, so an account can always be edited back into a shape it could have signed up with.
import { z } from "zod";
import { AUTH_ERRORS } from "@/lib/validation/auth";

export const ACCOUNT_ERRORS = {
  currentPasswordWrong: "Your current password is incorrect",
  samePassword: "Choose a password you aren't using now",
  emailTaken: "Another account already uses this email",
} as const;

export const profileSchema = z.object({
  name: z.string().trim().min(1, AUTH_ERRORS.nameRequired).max(80),
  email: z.string().trim().toLowerCase().email(AUTH_ERRORS.emailInvalid),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, AUTH_ERRORS.passwordRequired),
    newPassword: z.string().min(6, AUTH_ERRORS.passwordTooShort).max(200),
  })
  .refine((v) => v.currentPassword !== v.newPassword, { path: ["newPassword"], message: ACCOUNT_ERRORS.samePassword });

export const idSchema = z.string().uuid();
