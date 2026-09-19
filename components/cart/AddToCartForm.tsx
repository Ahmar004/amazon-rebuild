"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addToCart, buyNow } from "@/actions/cart";
import { QuantitySelect } from "@/components/product/QuantitySelect";

type AddToCartFormProps = {
  asin: string;
  maxQuantity: number;
};

// The buy box's "Add to cart" (yellow) and "Buy Now" (orange) buttons, one <form> so Enter
// submits "Add to cart" (CLAUDE.md forms rule). Add to cart adds the item and goes to the
// smart-wagon interstitial; Buy Now adds it and goes to /cart (Slice 7 sends it to checkout
// directly instead). Only rendered when the product is in stock (see BuyBox).
export function AddToCartForm({ asin, maxQuantity }: AddToCartFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.dataset.intent ?? "add-to-cart";

    setError(null);
    startTransition(async () => {
      const result =
        intent === "buy-now"
          ? await buyNow({ asin, quantity })
          : await addToCart({ asin, quantity, redirectTo: "smart-wagon" });
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
