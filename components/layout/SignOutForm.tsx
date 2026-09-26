"use client";

import { useTransition, type FormEvent, type ReactNode } from "react";
import { signOut } from "@/actions/auth";

type SignOutFormProps = {
  className?: string;
  children: ReactNode;
  /** Closes the menu holding this form. Next.js keeps a left page's state, so a menu left open
   *  at sign-out would reappear open after the next sign-in. */
  onSignOut?: () => void;
};

// A real <form> posting to the signOut action (docs/design.md 6.6: "signOut: destroySession,
// then redirect to /signin"), used by AccountMenu's and AllMenu's "Sign out" rows. A form (not a
// plain link) per CLAUDE.md: mutations are actions, and Enter submits it like any other form.
export function SignOutForm({ className, children, onSignOut }: SignOutFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSignOut?.();
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
