"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { setLocation } from "@/actions/location";
import { ROUTES } from "@/lib/constants/links";

type LocationModalProps = {
  open: boolean;
  onClose: () => void;
};

// "Choose your location" dialog: sign-in CTA (always shown - no session exists in this slice),
// then a zip form. On success it closes and calls router.refresh() so the server-rendered
// DeliverTo island (app/(shop)/layout.tsx) picks up the new deliver_to cookie.
export function LocationModal({ open, onClose }: LocationModalProps) {
  const router = useRouter();
  const inputId = useId();
  const [zip, setZip] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleClose() {
    setZip("");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await setLocation(zip);

    setPending(false);
    if (result.ok) {
      setZip("");
      onClose();
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Choose your location"
      labelledBy="location-modal-title"
    >
      <p className="text-[13px] text-text-muted">
        Delivery options and delivery speeds may vary for different locations
      </p>

      <Link
        href={ROUTES.signIn}
        className="mt-4 flex w-full items-center justify-center rounded-lg border border-btn-yellow-border bg-btn-yellow py-2 text-sm font-medium hover:bg-btn-yellow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
      >
        Sign in to see your addresses
      </Link>

      <div className="my-4 flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-text-muted">or enter a US zip code</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            or enter a US zip code
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            className="w-full rounded-md border border-border px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg border border-border bg-white px-4 py-1.5 text-sm hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link disabled:opacity-60"
        >
          Apply
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg border border-btn-yellow-border bg-btn-yellow px-6 py-1.5 text-sm font-medium hover:bg-btn-yellow-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
