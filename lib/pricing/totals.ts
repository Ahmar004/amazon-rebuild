// The server-computed order summary (docs/design.md 5.1, CLAUDE.md: "Money is calculated on the
// server ... the client displays those values"). Every checkout total (quoteCheckout,
// createPaymentIntent, finalizeOrder's re-check) is computed by this one function.
import type { DeliverySpeed } from "@/lib/pricing/shipping";
import { shippingCents } from "@/lib/pricing/shipping";
import { taxCents } from "@/lib/pricing/tax";
import type { UsState } from "@/lib/constants/us-states";

export type OrderTotals = {
  itemsCents: number;
  shippingCents: number;
  beforeTaxCents: number;
  taxCents: number;
  totalCents: number;
};

export type TotalsLine = { unitPriceCents: number; quantity: number };

export function computeTotals(input: { lines: TotalsLine[]; speed: DeliverySpeed; state: UsState }): OrderTotals {
  const itemsCents = input.lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const shipping = shippingCents(itemsCents, input.speed);
  const beforeTaxCents = itemsCents + shipping;
  const tax = taxCents(itemsCents, input.state);

  return {
    itemsCents,
    shippingCents: shipping,
    beforeTaxCents,
    taxCents: tax,
    totalCents: beforeTaxCents + tax,
  };
}
