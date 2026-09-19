// Money helpers. All prices are stored and passed around as integer cents (CLAUDE.md).

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function splitPrice(cents: number): { whole: string; fraction: string } {
  const wholeCents = Math.trunc(cents / 100);
  const fractionCents = Math.abs(cents % 100);
  return {
    whole: wholeCents.toLocaleString("en-US"),
    fraction: fractionCents.toString().padStart(2, "0"),
  };
}

export function discountPercent(priceCents: number, listPriceCents: number | null): number | null {
  if (listPriceCents === null || listPriceCents <= priceCents) return null;
  return Math.round(((listPriceCents - priceCents) / listPriceCents) * 100);
}
