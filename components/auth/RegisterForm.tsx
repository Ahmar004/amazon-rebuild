"use client";

import { register } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormAlert } from "@/components/auth/FormAlert";
import { useAuthForm } from "@/hooks/useAuthForm";

// Name, email and password on one screen (C11); the show-password toggle replaces a confirm field.
export function RegisterForm({ returnTo }: { returnTo: string }) {
  const { pending, onSubmit, error, fieldErrors } = useAuthForm((f) =>
    register({ name: f.name ?? "", email: f.email ?? "", password: f.password ?? "", returnTo }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {error && <FormAlert message={error} />}
      <Input label="Your name" name="name" autoComplete="name" autoFocus error={fieldErrors.name} />
      <Input label="Email" name="email" type="email" autoComplete="email" error={fieldErrors.email} />
      <PasswordInput
        label="Password"
        name="password"
        autoComplete="new-password"
        hint="At least 6 characters."
        error={fieldErrors.password}
      />
      <Button type="submit" size="lg" full disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
