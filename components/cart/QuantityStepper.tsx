"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

type QuantityStepperProps = {
  quantity: number;
  maxQuantity: number;
  /** Called with the new quantity; 0 means remove the line. */
  onChange: (next: number) => void;
  disabled?: boolean;
};

// The cart quantity pill: a trash icon (or a minus once quantity > 1), the count, and a plus. It
// only reports the new quantity; the cart drawer and /cart line decide how to apply it.
export function QuantityStepper({ quantity, maxQuantity, onChange, disabled = false }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border-strong bg-surface px-2.5 py-1">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled}
        aria-label={quantity <= 1 ? "Remove from cart" : "Decrease quantity"}
        className="flex h-6 w-6 items-center justify-center rounded-full text-fg hover:bg-surface-muted disabled:opacity-50"
      >
        {quantity <= 1 ? <Trash2 size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
      </button>
      <span aria-live="polite" className="min-w-[1.5ch] text-center text-sm font-semibold text-fg">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled || quantity >= maxQuantity}
        aria-label="Increase quantity"
        className="flex h-6 w-6 items-center justify-center rounded-full text-fg hover:bg-surface-muted disabled:opacity-30"
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
