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
};

// Header "Deliver to" block: sprite + two-line label that opens LocationModal, plus the
// first-visit LocationPrompt anchored underneath it (Task 3). Client island rendered by the
// server component DeliverTo (or its Suspense fallback) in app/(shop)/layout.tsx.
export function DeliverToButton({ location, showPrompt }: DeliverToButtonProps) {
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
