"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { AuthResult } from "@/actions/auth";

// Shared submit logic for the sign-in and create-account forms: reads the form's fields, calls the
// Server Action (which redirects on success) and keeps its errors for display.
export function useAuthForm(action: (fields: Record<string, string>) => Promise<AuthResult>) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<AuthResult | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries([...new FormData(event.currentTarget)].map(([k, v]) => [k, String(v)]));
    setResult(null);
    startTransition(async () => {
      const outcome = await action(fields);
      if (outcome && !outcome.ok) setResult(outcome);
    });
  }

  return { pending, onSubmit, error: result?.error, fieldErrors: result?.fieldErrors ?? {} };
}
