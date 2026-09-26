"use client";

import { useState, type FormEvent } from "react";
import { changePassword, updateProfile } from "@/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { useServerAction } from "@/hooks/useServerAction";

const CARD = "rounded-xl border border-border bg-surface p-5 shadow-card";

// Name and email. Enter submits (CLAUDE.md forms rule); errors show under each field.
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const { pending, run } = useServerAction();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = { name: String(data.get("name") ?? ""), email: String(data.get("email") ?? "") };
    run(() => updateProfile(input), "Your profile is updated", (result) => setErrors(result.ok ? {} : (result.fieldErrors ?? {})));
  }

  return (
    <form onSubmit={handleSubmit} className={CARD} noValidate>
      <h2 className="text-lg font-bold text-fg">Profile</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input label="Name" name="name" defaultValue={name} autoComplete="name" error={errors.name} />
        <Input label="Email" name="email" type="email" defaultValue={email} autoComplete="email" error={errors.email} />
      </div>
      <Button type="submit" className="mt-4 rounded-full" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

// Password change: needs the current password. The form clears after a successful change.
export function PasswordForm() {
  const { pending, run } = useServerAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = { currentPassword: String(data.get("currentPassword") ?? ""), newPassword: String(data.get("newPassword") ?? "") };
    run(() => changePassword(input), "Your password is changed", (result) => {
      setErrors(result.ok ? {} : (result.fieldErrors ?? {}));
      if (result.ok) setFormKey((k) => k + 1);
    });
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className={CARD} noValidate>
      <h2 className="text-lg font-bold text-fg">Security</h2>
      <p className="mt-1 text-sm text-fg-muted">Change the password you sign in with.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <PasswordInput label="Current password" name="currentPassword" autoComplete="current-password" error={errors.currentPassword} />
        <PasswordInput label="New password" name="newPassword" autoComplete="new-password" error={errors.newPassword} hint="At least 6 characters" />
      </div>
      <Button type="submit" className="mt-4 rounded-full" disabled={pending}>
        {pending ? "Updating..." : "Change password"}
      </Button>
    </form>
  );
}
