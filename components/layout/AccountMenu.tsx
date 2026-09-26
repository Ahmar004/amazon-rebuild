"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { SignOutForm } from "@/components/layout/SignOutForm";
import { ACCOUNT_LINKS } from "@/lib/constants/links";

// The header's account button and its dropdown: who is signed in, account links and sign out.
// Every storefront page needs an account (point 12), so there is no signed-out variant; the name
// and email arrive as streamed slots so the dropdown's open state survives them resolving.
export function AccountMenu({ firstName, identity }: { firstName: ReactNode; identity: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-fg hover:bg-surface-muted"
      >
        <UserRound size={20} aria-hidden="true" />
        <span className="hidden max-w-[120px] truncate sm:inline">{firstName}</span>
        <span className="sr-only sm:hidden">Account</span>
        <ChevronDown size={14} aria-hidden="true" className="hidden sm:block" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} anchorClassName="right-0" align="right" className="w-64 py-2">
        <div className="border-b border-border px-4 pb-3 pt-1">
          {identity}
        </div>
        <ul className="py-1">
          {ACCOUNT_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-fg hover:bg-surface-muted">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-1">
          <SignOutForm onSignOut={() => setOpen(false)} className="block w-full px-4 py-2 text-left text-sm text-fg hover:bg-surface-muted">Sign out</SignOutForm>
        </div>
      </Popover>
    </div>
  );
}
