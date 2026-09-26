"use client";

import { useState } from "react";
import { LocationModal } from "@/components/layout/LocationModal";
import { formatLocation, type DeliveryLocation } from "@/lib/location";

type BuyBoxLocationButtonProps = {
  location: DeliveryLocation;
};

// The buy box's "Deliver to <city> <zip>" row, opening the shared LocationModal (from Slice 1)
// so the buy box's delivery text stays consistent with the header's location.
export function BuyBoxLocationButton({ location }: BuyBoxLocationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1 text-sm text-fg hover:text-accent-hover"
      >
        <PinIcon />
        Deliver to {formatLocation(location)}
      </button>
      <LocationModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
