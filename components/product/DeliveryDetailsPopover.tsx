"use client";

import { useRef, useState } from "react";
import { Popover } from "@/components/ui/Popover";
import { formatPrice } from "@/lib/pricing/money";
import { FAST_FEE_CENTS, FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_FEE_CENTS } from "@/lib/pricing/shipping";

type DeliveryDetailsPopoverProps = {
  speed: "standard" | "fast";
};

// The buy box's "Details" link, explaining the shipping rule (docs/spec.md 6.2) in a small
// popover, built on the shared Popover from Slice 1.
export function DeliveryDetailsPopover({ speed }: DeliveryDetailsPopoverProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <span className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-accent hover:text-accent-hover hover:underline"
      >
        Details
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorClassName="left-0 top-full"
        className="w-64 p-3 text-xs text-fg"
        triggerRef={triggerRef}
      >
        {speed === "standard" ? (
          <p>
            FREE Standard delivery on orders of {formatPrice(FREE_SHIPPING_THRESHOLD_CENTS)} or more. Below that,
            Standard delivery costs {formatPrice(STANDARD_FEE_CENTS)} per order and arrives in 5 days.
          </p>
        ) : (
          <p>
            Fast delivery costs {formatPrice(FAST_FEE_CENTS)} per order, whatever the subtotal, and arrives in 2
            days.
          </p>
        )}
      </Popover>
    </span>
  );
}
