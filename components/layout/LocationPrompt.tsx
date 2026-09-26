"use client";

import { Popover } from "@/components/ui/Popover";
import { DEFAULT_LOCATION, formatLocation } from "@/lib/location";

type LocationPromptProps = {
  open: boolean;
  onDismiss: () => void;
  onChangeAddress: () => void;
};

// First-visit "We're showing you items that ship to ..." popover, anchored under the header's
// Deliver-to block (task-3-brief.md). Dismiss and Change Address both flip loc_prompt so it doesn't come back.
export function LocationPrompt({ open, onDismiss, onChangeAddress }: LocationPromptProps) {
  return (
    <Popover open={open} onClose={onDismiss} anchorClassName="left-0" className="w-[330px] p-4">
      <p className="text-[13px] leading-5 text-fg">
        We&apos;re showing you items that ship to{" "}
        <strong>{formatLocation(DEFAULT_LOCATION)}</strong>. To see items that ship to a
        different address, change your delivery address.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onChangeAddress}
          className="rounded-lg border border-accent bg-accent text-accent-fg px-3 py-1.5 text-sm font-medium hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Change Address
        </button>
      </div>
    </Popover>
  );
}
