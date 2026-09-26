"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/components/cart/CartProvider";
import { useFlash } from "@/hooks/useFlash";

type AddToCartButtonProps = {
  asin: string;
  /** Stretch to the width of its container (product cards). */
  full?: boolean;
  label?: string;
};

// Quick "Add to cart" on product cards: the header count bumps at once, the button briefly shows
// a check and "Added", a toast confirms with a "View cart" shortcut to the drawer, and the shopper
// stays where they are (C8, C20, point 18).
export function AddToCartButton({ asin, full = false, label = "Add to cart" }: AddToCartButtonProps) {
  const { add, setDrawerOpen } = useCart();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [added, flashAdded] = useFlash();

  function handleClick() {
    startTransition(async () => {
      const result = await add(asin, 1);
      if (result.ok) {
        flashAdded();
        toast("Added to cart", "success", { label: "View cart", onClick: () => setDrawerOpen(true) });
      } else toast(result.error, "error");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={buttonClass({ size: "sm", full, className: "rounded-full" })}
    >
      {pending ? (
        "Adding..."
      ) : added ? (
        <>
          <Check size={16} aria-hidden="true" className="animate-[check-in_250ms_ease-out]" />
          Added
        </>
      ) : (
        label
      )}
    </button>
  );
}
