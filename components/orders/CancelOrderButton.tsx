"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/actions/orders";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// "Cancel order" with an inline second step instead of a browser dialog. Only rendered while the
// order can still be cancelled; the server checks that again before refunding.
export function CancelOrderButton({ orderId, full = false }: { orderId: string; full?: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function confirm() {
    startTransition(async () => {
      const result = await cancelOrder(orderId);
      if (result.ok) {
        toast("Order cancelled. Your refund is on its way.");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
      setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <Button variant="secondary" full={full} className="rounded-full" onClick={() => setConfirming(true)}>
        Cancel order
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-danger/40 bg-danger/5 p-3 text-sm text-fg" role="group" aria-label="Confirm cancellation">
      <p>Cancel this order? The full amount goes back to your card.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="danger" size="sm" className="rounded-full" disabled={pending} onClick={confirm}>
          {pending ? "Cancelling..." : "Yes, cancel order"}
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full" disabled={pending} onClick={() => setConfirming(false)}>
          Keep order
        </Button>
      </div>
    </div>
  );
}
