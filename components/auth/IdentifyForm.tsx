"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { identify } from "@/actions/auth";
import { AuthField } from "@/components/auth/AuthField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { AuthSmallPrint } from "@/components/auth/AuthSmallPrint";

type IdentifyFormProps = {
  returnTo: string;
};

// Step 1 of "Sign in or create account" (docs/design.md 6.6): one field, routed by the identify
// action to the password step or to register. A real <form onSubmit> so Enter submits
// (CLAUDE.md forms rule).
export function IdentifyForm({ returnTo }: IdentifyFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "");

    setError(null);
    startTransition(async () => {
      const result = await identify({ identifier, returnTo });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(result.redirectTo);
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <AuthField
          id="identifier"
          name="identifier"
          label="Enter mobile number or email"
          type="text"
          autoComplete="username"
          autoFocus
          error={error ?? undefined}
        />
        <PrimaryButton disabled={pending}>Continue</PrimaryButton>
      </form>

      <AuthSmallPrint />
    </div>
  );
}
