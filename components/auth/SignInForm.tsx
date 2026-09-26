"use client";

import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormAlert } from "@/components/auth/FormAlert";
import { useAuthForm } from "@/hooks/useAuthForm";

// Email and password on one screen (C11). A real <form onSubmit> so Enter submits.
export function SignInForm({ returnTo, email }: { returnTo: string; email?: string }) {
  const { pending, onSubmit, error, fieldErrors } = useAuthForm((f) =>
    signIn({ email: f.email ?? "", password: f.password ?? "", returnTo }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="stagger-in space-y-4">
      {error && <FormAlert message={error} />}
      <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={email} autoFocus error={fieldErrors.email} />
      <PasswordInput label="Password" name="password" autoComplete="current-password" error={fieldErrors.password} />
      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
