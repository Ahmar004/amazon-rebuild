"use client";

import { useTransition } from "react";
import { saveForLater } from "@/actions/cart";

type SaveForLaterButtonProps = {
  asin: string;
};

export function SaveForLaterButton({ asin }: SaveForLaterButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => void (await saveForLater(asin)))}
      className="text-link hover:text-link-hover hover:underline disabled:opacity-60"
    >
      Save for later
    </button>
  );
}
