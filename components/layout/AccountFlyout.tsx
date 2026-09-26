"use client";

import Link from "next/link";
import { useRef } from "react";
import { Popover } from "@/components/ui/Popover";
import { CaretDown } from "@/components/layout/CaretDown";
import { NavAnchor } from "@/components/layout/NavAnchor";
import { navItemClass } from "@/components/layout/navItemClass";
import { SignOutForm } from "@/components/layout/SignOutForm";
import { useHoverPopover } from "@/hooks/useHoverPopover";
import { ACCOUNT_LINKS, ROUTES } from "@/lib/constants/links";
import type { SessionUser } from "@/lib/auth/current-user";

type AccountFlyoutProps = {
  user: SessionUser | null;
};

// "Hello, sign in / Account & Lists" (signed out) or "Hello, <firstName> / Account & Lists"
// (signed in). Opens on hover (100ms intent delay) or click, closes on leave/Esc/outside click.
// While open, everything below the header dims (fixed overlay starting under the 60px header).
export function AccountFlyout({ user }: AccountFlyoutProps) {
  const { open, onMouseEnter, onMouseLeave, toggle, close } = useHoverPopover(100);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex flex-col justify-center text-left ${navItemClass}`}
      >
        <span className="whitespace-nowrap text-xs leading-[14px]">
          Hello, {user ? user.firstName : "sign in"}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap text-sm font-bold leading-[15px]">
          Account
          <CaretDown />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-[60px] z-40 bg-black/50"
          aria-hidden="true"
          onClick={close}
        />
      )}

      <Popover
        open={open}
        onClose={close}
        triggerRef={triggerRef}
        anchorClassName="right-0"
        className="w-[280px] p-5 text-fg"
      >
        {user ? (
          <div className="flex items-center justify-between border-b border-border pb-4">
            <p className="text-sm">
              Hello, <span className="font-bold">{user.firstName}</span>
            </p>
            <Link
              href={ROUTES.signIn}
              className="text-xs text-accent hover:text-accent-hover hover:underline"
            >
              Switch Accounts
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center border-b border-border pb-4">
            <Link
              href={ROUTES.signIn}
              className="flex w-[200px] items-center justify-center rounded-lg border border-accent bg-accent text-accent-fg py-1.5 text-sm font-medium hover:bg-accent-hover"
            >
              Sign in
            </Link>
            <p className="mt-2 text-xs">
              New customer?{" "}
              <Link href={ROUTES.register} className="text-accent hover:text-accent-hover hover:underline">
                Start here.
              </Link>
            </p>
          </div>
        )}

        <div className="pt-4">
          <div>
            <h3 className="mb-2 text-base font-bold">Your Account</h3>
            <ul className="space-y-1.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <NavAnchor
                    link={link}
                    className="text-[13px] text-fg-muted hover:text-accent-hover hover:underline"
                  />
                </li>
              ))}
              {user && (
                <li>
                  <SignOutForm className="text-[13px] text-fg-muted hover:text-accent-hover hover:underline">
                    Sign Out
                  </SignOutForm>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Popover>
    </div>
  );
}
