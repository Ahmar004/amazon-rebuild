"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { ROUTES } from "@/lib/constants/links";

type PasswordFormProps = {
  email: string;
  returnTo: string;
};

const FORGOT_PASSWORD_URL = "https://www.amazon.com/ap/forgotpassword";

// Step 2 (known email) of the sign-in flow (docs/design.md 6.6): the email with a "Change" link
// back to step 1, the password field, and "Your password is incorrect" on failure.
export function PasswordForm({ email, returnTo }: PasswordFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");

    setError(null);
    startTransition(async () => {
      const result = await signIn({ email, password, returnTo });
      if (!result.ok) setError(result.error);
    });
  }

  const changeHref = `${ROUTES.signIn}?email=${encodeURIComponent(email)}&return_to=${encodeURIComponent(returnTo)}`;

  return (
    <div>
      {error && <AuthAlert message={error} />}

      <div className="mb-3">
        <p className="text-sm font-bold text-text">{email}</p>
        <Link href={changeHref} className="text-xs text-link hover:text-link-hover hover:underline">
          Change
        </Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-1 flex items-baseline justify-between">
          <label htmlFor="password" className="text-sm font-bold text-text">
            Password
          </label>
          <a
            href={FORGOT_PASSWORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-link hover:text-link-hover hover:underline"
          >
            Forgot password?
          </a>
        </div>
        <AuthField
          id="password"
          name="password"
          label="Password"
          hideLabel
          type="password"
          autoComplete="current-password"
          autoFocus
        />
        <PrimaryButton disabled={pending}>Sign in</PrimaryButton>
      </form>
    </div>
  );
}
