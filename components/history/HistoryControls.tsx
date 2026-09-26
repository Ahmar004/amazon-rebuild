"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { clearBrowsingHistory, removeHistoryItem } from "@/actions/history";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// "Remove" under one history card. The action revalidates /history, so the card drops out.
export function RemoveFromHistoryButton({ asin }: { asin: string }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await removeHistoryItem(asin);
          if (!result.ok) toast(result.error, "error");
        })
      }
      className="mt-1 inline-flex items-center gap-1 self-start text-xs font-semibold text-fg-muted hover:text-danger disabled:opacity-60"
    >
      <X size={12} aria-hidden="true" />
      {pending ? "Removing..." : "Remove"}
    </button>
  );
}

// "Clear history" asks for a second click instead of a browser dialog.
export function ClearHistoryButton() {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
        Clear history
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-fg-muted">Remove every item?</span>
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await clearBrowsingHistory();
            if (result.ok) toast("Browsing history cleared");
            else toast(result.error, "error");
            setConfirming(false);
          })
        }
      >
        {pending ? "Clearing..." : "Yes, clear"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
