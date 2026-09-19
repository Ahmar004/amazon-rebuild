import type { DeliverySpeed } from "@/lib/pricing/shipping";
import { formatPrice } from "@/lib/pricing/money";

export type ReviewItem = {
  asin: string;
  title: string;
  imageUrl: string;
  unitPriceCents: number;
  quantity: number;
};

type ReviewStepProps = {
  items: ReviewItem[];
  speed: DeliverySpeed;
  onSpeedChange: (speed: DeliverySpeed) => void;
  standardDate: string;
  fastDate: string;
  standardShippingCents: number;
  fastShippingCents: number;
};

// Step 3 of checkout (docs/spec.md 5.8): the item list, then the two delivery-speed radios, each
// with its date and fee ("FREE Standard Delivery" when the order clears the free-shipping
// threshold, section 6.2).
export function ReviewStep({
  items,
  speed,
  onSpeedChange,
  standardDate,
  fastDate,
  standardShippingCents,
  fastShippingCents,
}: ReviewStepProps) {
  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold text-text">Review items and shipping</h2>

      <ul className="mt-3 divide-y divide-border">
        {items.map((item) => (
          <li key={item.asin} className="flex gap-3 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.title} className="h-16 w-16 shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm text-text">{item.title}</p>
              <p className="mt-1 text-sm font-bold text-text">{formatPrice(item.unitPriceCents)}</p>
              <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
            </div>
          </li>
        ))}
      </ul>

      <div role="radiogroup" aria-label="Delivery speed" className="mt-3 space-y-2 border-t border-border pt-3">
        <label
          className={`flex cursor-pointer gap-2 rounded border p-3 text-sm text-text ${
            speed === "standard" ? "border-link" : "border-border"
          }`}
        >
          <input
            type="radio"
            name="speed"
            className="mt-0.5 shrink-0"
            checked={speed === "standard"}
            onChange={() => onSpeedChange("standard")}
          />
          <span>
            {standardDate} - {standardShippingCents === 0 ? "FREE Standard Delivery" : `${formatPrice(standardShippingCents)} - Standard Delivery`}
          </span>
        </label>

        <label
          className={`flex cursor-pointer gap-2 rounded border p-3 text-sm text-text ${
            speed === "fast" ? "border-link" : "border-border"
          }`}
        >
          <input
            type="radio"
            name="speed"
            className="mt-0.5 shrink-0"
            checked={speed === "fast"}
            onChange={() => onSpeedChange("fast")}
          />
          <span>
            {fastDate} - {formatPrice(fastShippingCents)} - Fast Delivery
          </span>
        </label>
      </div>
    </section>
  );
}
