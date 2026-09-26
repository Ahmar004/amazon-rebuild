import { Truck, Zap } from "lucide-react";
import type { DeliverySpeed } from "@/lib/pricing/shipping";
import { formatPrice } from "@/lib/pricing/money";
import { CheckoutSection, choiceClass } from "@/components/checkout/CheckoutSection";

type DeliveryStepProps = {
  speed: DeliverySpeed;
  onSpeedChange: (speed: DeliverySpeed) => void;
  standardDate: string;
  fastDate: string;
  standardShippingCents: number;
  fastShippingCents: number;
};

// Section 2 of checkout: the two delivery speeds, each with its date and the fee the server quoted.
export function DeliveryStep({ speed, onSpeedChange, standardDate, fastDate, standardShippingCents, fastShippingCents }: DeliveryStepProps) {
  const options = [
    {
      value: "standard" as const,
      icon: Truck,
      label: "Standard delivery",
      date: standardDate,
      fee: standardShippingCents === 0 ? "FREE" : formatPrice(standardShippingCents),
    },
    { value: "fast" as const, icon: Zap, label: "Fast delivery", date: fastDate, fee: formatPrice(fastShippingCents) },
  ];

  return (
    <CheckoutSection step={2} title="Delivery speed" done>
      <div role="radiogroup" aria-label="Delivery speed" className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={choiceClass(speed === option.value)}>
            <input
              type="radio"
              name="speed"
              className="mt-1 shrink-0 accent-[var(--color-accent)]"
              checked={speed === option.value}
              onChange={() => onSpeedChange(option.value)}
            />
            <span className="flex-1">
              <span className="flex items-center gap-1.5 font-semibold">
                <option.icon size={15} aria-hidden="true" />
                {option.label}
              </span>
              <span className="mt-0.5 block text-fg-muted">Arrives {option.date}</span>
            </span>
            <span className={`font-bold ${option.fee === "FREE" ? "text-success" : ""}`}>{option.fee}</span>
          </label>
        ))}
      </div>
    </CheckoutSection>
  );
}
