"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";
import { removeListing, setListingPaused } from "@/actions/listings";
import { Button, buttonClass } from "@/components/ui/Button";
import { useServerAction } from "@/hooks/useServerAction";
import { editListingHref } from "@/lib/constants/links";
import { LISTING_STATUS, type ListingStatus } from "@/lib/constants/listings";

// Edit, Pause / Resume and Delete (two steps, inline) for one of the seller's listings.
export function ListingActions({ asin, status }: { asin: string; status: ListingStatus }) {
  const { pending, run } = useServerAction();
  const [confirming, setConfirming] = useState(false);
  const paused = status === LISTING_STATUS.paused;

  if (confirming) {
    return (
      <div className="rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-fg animate-[fade-in_150ms_ease-out]" role="group" aria-label="Confirm delete">
        <p>Delete this listing? It leaves the store, carts and wishlists. Orders already placed are kept.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="danger" size="sm" className="rounded-full" disabled={pending} onClick={() => run(() => removeListing(asin), "Listing deleted", () => setConfirming(false))}>
            {pending ? "Deleting..." : "Yes, delete"}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full" disabled={pending} onClick={() => setConfirming(false)}>
            Keep listing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={editListingHref(asin)} className={buttonClass({ variant: "secondary", size: "sm", className: "rounded-full" })}>
        <Pencil size={14} aria-hidden="true" />
        Edit
      </Link>
      <Button
        variant="secondary"
        size="sm"
        className="rounded-full"
        disabled={pending}
        onClick={() => run(() => setListingPaused(asin, !paused), paused ? "Listing is live again" : "Listing paused")}
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        {paused ? "Resume" : "Pause"}
      </Button>
      <Button variant="danger-ghost" size="sm" className="rounded-full" disabled={pending} onClick={() => setConfirming(true)}>
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </Button>
    </div>
  );
}
