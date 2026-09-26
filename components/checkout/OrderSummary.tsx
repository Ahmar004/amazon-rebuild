import { Lock } from "lucide-react";
import type { OrderTotals } from "@/lib/pricing/totals";
import type { CheckoutSourceLine } from "@/lib/checkout/source";
import { formatPrice } from "@/lib/pricing/money";

type OrderSummaryProps = {
  items: CheckoutSourceLine[];
  totals: OrderTotals;
  /** Why the order can't be placed yet, or null when it can. */
  blocker: string | null;
  placing: boolean;
  /** True while the server re-quotes after an address or speed change. */
  updating: boolean;
  error: string | null;
  onPlaceOrder: () => void;
};

// The live order summary beside the checkout sections (C12): the items, then every total exactly
// as quoteCheckout worked it out on the server (the client never computes the charged amount).
export function OrderSummary({ items, totals, blocker, placing, updating, error, onPlaceOrder }: OrderSummaryProps) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside aria-label="Order summary" className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <h2 className="text-lg font-bold text-fg">
        Order summary <span className="text-sm font-normal text-fg-muted">({count} {count === 1 ? "item" : "items"})</span>
      </h2>

      <ul className="mt-3 max-h-[260px] divide-y divide-border overflow-y-auto">
        {items.map((item) => (
          <li key={item.asin} className="flex gap-3 py-2.5">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain" />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-fg px-1 text-[11px] font-bold text-bg">
                {item.quantity}
              </span>
            </span>
            <p className="line-clamp-2 max-h-10 min-w-0 flex-1 overflow-hidden text-sm leading-5 text-fg">{item.title}</p>
            <p className="text-sm font-semibold text-fg">{formatPrice(item.lineTotalCents)}</p>
          </li>
        ))}
      </ul>

      <dl className={`mt-3 space-y-1.5 border-t border-border pt-3 text-sm text-fg transition-opacity ${updating ? "opacity-50" : ""}`}>
        <Row label="Items" value={formatPrice(totals.itemsCents)} />
        <Row label="Shipping" value={totals.shippingCents === 0 ? "FREE" : formatPrice(totals.shippingCents)} />
        <Row label="Estimated tax" value={formatPrice(totals.taxCents)} />
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-lg font-bold">
          <dt>Order total</dt>
          <dd>{formatPrice(totals.totalCents)}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={blocker !== null || placing || updating}
        className="mt-4 h-12 w-full rounded-full bg-accent px-4 text-base font-bold text-accent-fg transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placing ? "Placing your order..." : `Place order - ${formatPrice(totals.totalCents)}`}
      </button>

      {blocker && !placing && <p className="mt-2 text-center text-xs text-fg-muted">{blocker}</p>}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-fg-muted">
        <Lock size={12} aria-hidden="true" />
        Card payments are processed by Stripe in test mode.
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-fg-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
