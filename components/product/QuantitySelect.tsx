type QuantitySelectProps = {
  max: number;
};

// Amazon's grey rounded "Quantity: N" select, 1 up to min(stock, 30) (docs/spec.md 5.5, 6.6).
// A plain <select> - no onChange handler yet, since "Add to cart" arrives in Slice 5 and this
// slice leaves that slot empty rather than wiring a dead control.
export function QuantitySelect({ max }: QuantitySelectProps) {
  if (max <= 0) return null;
  const options = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <label className="inline-block">
      <span className="sr-only">Quantity</span>
      <select
        name="quantity"
        defaultValue={1}
        className="rounded-lg border border-border bg-search-dept px-2 py-1.5 text-sm text-text"
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
