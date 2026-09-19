"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Sprite } from "@/components/ui/Sprite";
import { Popover } from "@/components/ui/Popover";
import { ROUTES } from "@/lib/constants/links";
import type { ReactNode } from "react";

// The checkout-only header (docs/spec.md 5.8: "a minimal header with the logo, 'Secure checkout'
// ... and the cart link. It has no search bar."). "Secure checkout" opens a dropdown explaining
// how payment data is protected (recon: 6-checkout-page-small-drop-down-for-security-info...).
export function CheckoutHeader({ cartLink }: { cartLink: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="relative flex h-[60px] items-center justify-between bg-nav px-4">
      <Link href={ROUTES.home} className="shrink-0">
        <Sprite name="logo" label="Amazon" />
      </Link>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1 whitespace-nowrap text-lg font-bold text-white"
        >
          Secure checkout
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 5 L8 11 L14 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
          anchorClassName="left-1/2 -translate-x-1/2"
          className="w-[320px] p-4 text-left"
        >
          <p className="text-sm text-text">
            We secure your payment and personal information when you share or save it with us. We
            don&apos;t share payment details with third-party sellers. We don&apos;t sell your
            information to others.{" "}
            <Link href={ROUTES.customerService} className="text-link hover:text-link-hover hover:underline">
              Learn more
            </Link>
          </p>
        </Popover>
      </div>

      {cartLink}
    </header>
  );
}
