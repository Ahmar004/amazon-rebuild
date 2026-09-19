"use client";

import { useState, useTransition } from "react";
import { deleteItem, updateQuantity } from "@/actions/cart";

type QuantityStepperProps = {
  asin: string;
  quantity: number;
  maxQuantity: number;
};

// Amazon's yellow-bordered cart quantity pill: a trash icon (or a minus once quantity > 1),
// the count, and a plus, each wired straight to the updateQuantity / deleteItem Server Actions
// (docs/superpowers/plans/2026-09-19-slice-5-cart.md). Used by CartLine and MiniCart.
export function QuantityStepper({ asin, quantity, maxQuantity }: QuantityStepperProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: number) {
    setError(null);
    startTransition(async () => {
      const result = next <= 0 ? await deleteItem(asin) : await updateQuantity(asin, next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-3 rounded-full border border-btn-yellow-border bg-search-dept px-3 py-1">
        <button
          type="button"
          onClick={() => change(quantity - 1)}
          disabled={pending}
          aria-label={quantity <= 1 ? "Delete" : "Decrease quantity"}
          className="flex h-5 w-5 items-center justify-center text-text disabled:opacity-50"
        >
          {quantity <= 1 ? <TrashIcon /> : <MinusIcon />}
        </button>
        <span aria-live="polite" className="min-w-[1ch] text-center text-sm text-text">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => change(quantity + 1)}
          disabled={pending || quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="flex h-5 w-5 items-center justify-center text-text disabled:opacity-30"
        >
          <PlusIcon />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M6 4V2.5A.5.5 0 0 1 6.5 2h3a.5.5 0 0 1 .5.5V4m2 0-.6 9.1a1 1 0 0 1-1 .9H5.6a1 1 0 0 1-1-.9L4 4"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
