import type { OrderTotals } from "@/lib/pricing/totals";
import { formatPrice } from "@/lib/pricing/money";

type OrderSummaryProps = {
  totals: OrderTotals;
  disabled: boolean;
  placing: boolean;
  error: string | null;
  onPlaceOrder: () => void;
};

// The right-column sticky order summary (docs/spec.md 5.8): every value comes from quoteCheckout
// on the server (CLAUDE.md: "the client displays those values and never computes the charged
// amount itself"). The button stays disabled until an address and a payment method are chosen.
export function OrderSummary({ totals, disabled, placing, error, onPlaceOrder }: OrderSummaryProps) {
  return (
    <div className="sticky top-4 rounded-lg bg-surface p-4">
      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={disabled || placing}
        className="w-full rounded-full border border-accent bg-accent px-4 py-2 text-sm font-bold text-accent-fg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placing ? "Placing your order..." : "Place your order"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-fg">
        <div className="flex justify-between">
          <span>Items:</span>
          <span>{formatPrice(totals.itemsCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping &amp; handling:</span>
          <span>{formatPrice(totals.shippingCents)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1">
          <span>Total before tax:</span>
          <span>{formatPrice(totals.beforeTaxCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated tax to be collected:</span>
          <span>{formatPrice(totals.taxCents)}</span>
        </div>
      </div>

      <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-bold text-deal">
        <span>Order total:</span>
        <span>{formatPrice(totals.totalCents)}</span>
      </div>
    </div>
  );
}
