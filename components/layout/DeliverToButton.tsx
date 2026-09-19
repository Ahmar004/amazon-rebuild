"use client";

import { useState, useTransition } from "react";
import { Sprite } from "@/components/ui/Sprite";
import { navItemClass } from "@/components/layout/navItemClass";
import { LocationPrompt } from "@/components/layout/LocationPrompt";
import { LocationModal } from "@/components/layout/LocationModal";
import { dismissLocationPrompt } from "@/actions/location";
import { formatLocation, type DeliveryLocation } from "@/lib/location";

type DeliverToButtonProps = {
  location: DeliveryLocation;
  showPrompt: boolean;
  /** "mobile" renders the full-width row 4 of HeaderMobile instead of the desktop nav item. */
  variant?: "desktop" | "mobile";
};

// Header "Deliver to" block: sprite + two-line label that opens LocationModal, plus the
// first-visit LocationPrompt anchored underneath it (Task 3). Client island rendered by the
// server component DeliverTo (or its Suspense fallback) in app/(shop)/layout.tsx. The mobile
// variant (Task 4) reuses the same location data and LocationModal so the logic isn't duplicated.
export function DeliverToButton({ location, showPrompt, variant = "desktop" }: DeliverToButtonProps) {
  const [promptOpen, setPromptOpen] = useState(showPrompt);
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleDismiss() {
    setPromptOpen(false);
    startTransition(() => {
      void dismissLocationPrompt();
    });
  }

  function handleChangeAddress() {
    setPromptOpen(false);
    setModalOpen(true);
  }

  if (variant === "mobile") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center gap-2 bg-back-to-top px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
        >
          <Sprite name="location" />
          <span className="text-sm">
            Deliver to {formatLocation(location)}
          </span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true" className="ml-auto">
            <path d="M0 0 L5 6 L10 0 Z" fill="currentColor" />
          </svg>
        </button>

        <LocationModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1 ${navItemClass}`}
      >
        <Sprite name="location" />
        <span className="flex flex-col text-left">
          <span className="text-xs leading-[14px] text-nav-muted">Deliver to</span>
          <span className="text-sm font-bold leading-[15px] text-white">
            {formatLocation(location)}
          </span>
        </span>
      </button>

      <LocationPrompt
        open={promptOpen}
        onDismiss={handleDismiss}
        onChangeAddress={handleChangeAddress}
      />

      <LocationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
