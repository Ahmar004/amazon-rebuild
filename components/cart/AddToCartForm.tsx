"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/actions/cart";
import { QuantitySelect } from "@/components/product/QuantitySelect";
import { ROUTES } from "@/lib/constants/links";

type AddToCartFormProps = {
  asin: string;
  maxQuantity: number;
};

// The buy box's "Add to cart" (yellow) and "Buy Now" (orange) buttons, one <form> so Enter
// submits "Add to cart" (CLAUDE.md forms rule). Add to cart adds the item and goes to the
// smart-wagon interstitial. Buy Now skips the cart entirely (docs/spec.md 5.8: "Buy Now skips
// the cart and opens checkout with only that product and quantity; the rest of the cart stays as
// it was") by navigating straight to /checkout?buy=<asin>:<qty>; requireUser there sends a
// signed-out visitor to sign in first with that URL as return_to. Only rendered when the product
// is in stock (see BuyBox).
export function AddToCartForm({ asin, maxQuantity }: AddToCartFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.dataset.intent ?? "add-to-cart";

    setError(null);

    if (intent === "buy-now") {
      router.push(`${ROUTES.checkout}?buy=${encodeURIComponent(asin)}:${quantity}`);
      return;
    }

    startTransition(async () => {
      const result = await addToCart({ asin, quantity, redirectTo: "smart-wagon" });
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <QuantitySelect max={maxQuantity} />
      <button
        type="submit"
        data-intent="add-to-cart"
        disabled={pending}
        className="w-full rounded-full border border-btn-yellow-border bg-btn-yellow px-3 py-1.5 text-sm text-text hover:bg-btn-yellow-hover disabled:opacity-60"
      >
        Add to Cart
      </button>
      <button
        type="submit"
        data-intent="buy-now"
        disabled={pending}
        className="w-full rounded-full border border-btn-orange-border bg-btn-orange px-3 py-1.5 text-sm text-text hover:bg-btn-orange-hover disabled:opacity-60"
      >
        Buy Now
      </button>
      {error && (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
    </form>
  );
}
