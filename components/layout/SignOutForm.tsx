"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { signOut } from "@/actions/auth";

type SignOutFormProps = {
  className?: string;
  children: ReactNode;
};

// A real <form> posting to the signOut action (docs/design.md 6.6: "signOut: destroySession,
// then redirect to /"), used by AccountFlyout's and SideMenu's "Sign Out" rows. A form (not a
// plain link) per CLAUDE.md: mutations are actions, and Enter submits it like any other form.
export function SignOutForm({ className, children }: SignOutFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      signOut();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={pending} className={className}>
        {children}
      </button>
    </form>
  );
}
