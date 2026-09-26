"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { formatCompactPrice } from "@/lib/pricing/money";

export type CountUpFormat = "price" | "count";

const FORMAT: Record<CountUpFormat, (value: number) => string> = {
  price: formatCompactPrice,
  count: (value) => value.toLocaleString("en-US"),
};

// A number that counts up to its value (cents for "price"). Screen readers get the final value
// only, not every step.
export function CountUp({ value, format }: { value: number; format: CountUpFormat }) {
  const shown = useCountUp(value);
  return (
    <>
      <span aria-hidden="true" className="tabular-nums">{FORMAT[format](shown)}</span>
      <span className="sr-only">{FORMAT[format](value)}</span>
    </>
  );
}
