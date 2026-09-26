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

const PRICE_PATTERN = /^(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;

// Reads a typed dollar amount ("19.99", "1,250") as integer cents, or null when it isn't one.
export function parsePriceToCents(input: string): number | null {
  const value = input.trim();
  if (!PRICE_PATTERN.test(value)) return null;
  const [whole, fraction = ""] = value.replace(/,/g, "").split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

const COMPACT_USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

// "$12.9K"-style amounts for chart axes and stat tiles.
export function formatCompactPrice(cents: number): string {
  return COMPACT_USD.format(cents / 100);
}
