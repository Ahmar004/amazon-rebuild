import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/pricing/money";
import type { FreeShippingProgress } from "@/lib/pricing/shipping";

// "You're $X away from free shipping" (C8). The numbers come from freeShippingProgress on the server.
export function FreeShippingBar({ progress }: { progress: FreeShippingProgress }) {
  return (
    <div className="rounded-lg bg-accent-soft px-3 py-2.5 text-sm text-fg">
      <p className="flex items-center gap-2">
        <Truck size={16} className="shrink-0 text-accent" aria-hidden="true" />
        {progress.qualified ? (
          <span>
            Your order qualifies for <strong>free standard shipping</strong>.
          </span>
        ) : (
          <span>
            You&apos;re <strong>{formatPrice(progress.remainingCents)}</strong> away from free shipping.
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  );
}
