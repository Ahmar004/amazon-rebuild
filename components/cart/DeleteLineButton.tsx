"use client";

import { useTransition } from "react";
import { deleteItem } from "@/actions/cart";

type DeleteLineButtonProps = {
  asin: string;
};

// The plain-text "Delete" link next to the quantity stepper (recon: "Delete | Save for later |
// Share"), redundant with the stepper's own trash icon but matching amazon.com's row exactly.
export function DeleteLineButton({ asin }: DeleteLineButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => void (await deleteItem(asin)))}
      className="text-link hover:text-link-hover hover:underline disabled:opacity-60"
    >
      Delete
    </button>
  );
}
