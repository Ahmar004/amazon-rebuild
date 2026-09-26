"use client";

import { House, Truck } from "lucide-react";
import { markDelivered, markShipped } from "@/actions/seller-orders";
import { Button } from "@/components/ui/Button";
import { useServerAction } from "@/hooks/useServerAction";
import { FULFILMENT_STEP, type FulfilmentStep } from "@/lib/constants/seller";

// "Mark as shipped" / "Mark as delivered" for one sold item (D3). Shipping ends the buyer's chance
// to cancel, which the toast says.
export function FulfilmentButton({ orderId, asin, step }: { orderId: string; asin: string; step: FulfilmentStep }) {
  const { pending, run } = useServerAction();
  const shipping = step === FULFILMENT_STEP.shipped;
  return (
    <Button
      size="sm"
      variant={shipping ? "primary" : "secondary"}
      className="rounded-full"
      disabled={pending}
      onClick={() =>
        run(
          () => (shipping ? markShipped(orderId, asin) : markDelivered(orderId, asin)),
          shipping ? "Marked as shipped. The buyer can see it's on the way." : "Marked as delivered.",
        )
      }
    >
      {shipping ? <Truck size={14} aria-hidden="true" /> : <House size={14} aria-hidden="true" />}
      {pending ? "Saving..." : shipping ? "Mark as shipped" : "Mark as delivered"}
    </Button>
  );
}
