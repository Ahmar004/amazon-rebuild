type QuantitySelectProps = {
  max: number;
};

// The rounded "Quantity: N" select, 1 up to min(stock, 30) (docs/spec.md 5.5, 6.6).
// A plain uncontrolled <select> - components/cart/AddToCartForm.tsx reads its value from
// FormData on submit rather than wiring an onChange handler.
export function QuantitySelect({ max }: QuantitySelectProps) {
  if (max <= 0) return null;
  const options = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <label className="inline-block">
      <span className="sr-only">Quantity</span>
      <select
        name="quantity"
        defaultValue={1}
        className="rounded-xl border border-border bg-surface-muted px-2 py-1.5 text-sm text-fg"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            Quantity: {n}
          </option>
        ))}
      </select>
    </label>
  );
}
