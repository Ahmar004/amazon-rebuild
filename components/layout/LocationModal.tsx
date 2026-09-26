"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Input";
import { setLocation } from "@/actions/location";

type LocationModalProps = {
  open: boolean;
  onClose: () => void;
};

// "Choose your location" dialog: a zip form. On success it closes and calls router.refresh() so the server-rendered
// product page picks up the new deliver_to cookie.
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
      <p className="text-[13px] text-fg-muted">
        Delivery options and delivery speeds may vary for different locations
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2">
        <div className="flex-1">
          <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-fg">
            US zip code
          </label>
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(event) => setZip(event.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClass({ variant: "secondary", className: "mt-6 shrink-0" })}
        >
          Apply
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          className={buttonClass()}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
