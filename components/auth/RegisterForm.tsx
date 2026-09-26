"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { AuthSmallPrint } from "@/components/auth/AuthSmallPrint";
import { ROUTES } from "@/lib/constants/links";
import { AUTH_ERRORS } from "@/lib/validation/auth";

type RegisterFormProps = {
  email: string;
  returnTo: string;
};

// "Create account" (docs/design.md 6.6): email with "Change", name, password (with hint),
// confirm password, and "Already a customer? Sign in instead".
export function RegisterForm({ email, returnTo }: RegisterFormProps) {
  const [pending, startTransition] = useTransition();
  const [alert, setAlert] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    setAlert(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await register({ email, name, password, confirmPassword, returnTo });
      if (!result.ok) {
        if (result.error === AUTH_ERRORS.emailTaken) {
          setAlert(result.error);
        } else if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        } else {
          setAlert(result.error);
        }
      }
    });
  }

  const changeHref = `${ROUTES.signIn}?email=${encodeURIComponent(email)}&return_to=${encodeURIComponent(returnTo)}`;
  const signInHref = `${ROUTES.signIn}/password?email=${encodeURIComponent(email)}&return_to=${encodeURIComponent(returnTo)}`;

  return (
    <div>
      {alert && (
        <AuthAlert
          message={
            alert === AUTH_ERRORS.emailTaken ? (
              <>
                {alert}.{" "}
                <Link href={signInHref} className="text-accent hover:text-accent-hover hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              alert
            )
          }
        />
      )}

      <div className="mb-3">
        <p className="text-sm font-bold text-fg">Email</p>
        <p className="text-sm text-fg">
          {email}{" "}
          <Link href={changeHref} className="text-xs text-accent hover:text-accent-hover hover:underline">
            Change
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="name"
          name="name"
          label="Your name"
          type="text"
          placeholder="First and last name"
          autoComplete="name"
          autoFocus
          error={fieldErrors.name}
        />
        <AuthField
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="Passwords must be at least 6 characters."
          error={fieldErrors.password}
        />
        <AuthField
          id="confirmPassword"
          name="confirmPassword"
          label="Re-enter password"
          type="password"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
        <PrimaryButton disabled={pending}>Continue</PrimaryButton>
      </form>

      <AuthSmallPrint />

      <hr className="my-4 border-border" />

      <p className="text-sm text-fg">
        Already a customer?{" "}
        <Link href={signInHref} className="text-accent hover:text-accent-hover hover:underline">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
