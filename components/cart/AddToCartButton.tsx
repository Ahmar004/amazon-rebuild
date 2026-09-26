"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/actions/cart";
import { buttonClass } from "@/components/ui/Button";

const ADDED_DISPLAY_MS = 1500;

type AddToCartButtonProps = {
  asin: string;
  /** Stretch to the width of its container (product cards). */
  full?: boolean;
};

// The small yellow "Add to cart" button on search rows and carousel tiles: adds one unit in
// place, shows a spinner then a brief "Added" state, and never navigates away (the header count
// updates via the action's own revalidatePath).
export function AddToCartButton({ asin, full = false }: AddToCartButtonProps) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "added" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setStatus("idle");
    setError(null);
    startTransition(async () => {
      const result = await addToCart({ asin, quantity: 1, redirectTo: "none" });
      if (result.ok) {
        setStatus("added");
        setTimeout(() => setStatus("idle"), ADDED_DISPLAY_MS);
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={buttonClass({ size: "sm", full, className: "rounded-full" })}
      >
        {pending ? "Adding..." : status === "added" ? "Added" : "Add to cart"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
