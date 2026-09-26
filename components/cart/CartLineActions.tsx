"use client";

import { useOptimistic, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import type { CartActionResult } from "@/actions/cart";

const LINK = "text-accent hover:text-accent-hover hover:underline disabled:opacity-60";

// Runs one cart change for a /cart row and reports a refusal as a toast. The action revalidates
// the page, so the server-rendered row and subtotal catch up on their own.
function useCartRowAction() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  function run(call: () => Promise<CartActionResult>, done?: string, before?: () => void) {
    startTransition(async () => {
      before?.();
      const result = await call();
      if (!result.ok) toast(result.error, "error");
      else if (done) toast(done);
    });
  }
  return { pending, run };
}

type CartLineActionsProps = { asin: string; quantity: number; maxQuantity: number };

// Stepper, Delete and Save for later under a /cart line. The stepper moves instantly (C20).
export function CartLineActions({ asin, quantity, maxQuantity }: CartLineActionsProps) {
  const cart = useCart();
  const { pending, run } = useCartRowAction();
  const [shown, setShown] = useOptimistic(quantity);

  return (
    <>
      <QuantityStepper
        quantity={shown}
        maxQuantity={maxQuantity}
        onChange={(next) =>
          run(() => cart.setQuantity(asin, next), next <= 0 ? "Removed from your cart" : undefined, () => setShown(next))
        }
      />
      <button type="button" disabled={pending} onClick={() => run(() => cart.setQuantity(asin, 0), "Removed from your cart")} className={LINK}>
        Delete
      </button>
      <button type="button" disabled={pending} onClick={() => run(() => cart.saveForLater(asin), "Saved for later")} className={LINK}>
        Save for later
      </button>
    </>
  );
}

// Move to cart and Delete under a saved-for-later item.
export function SavedItemActions({ asin }: { asin: string }) {
  const cart = useCart();
  const { pending, run } = useCartRowAction();

  return (
    <>
      <button type="button" disabled={pending} onClick={() => run(() => cart.moveToCart(asin), "Moved to your cart")} className={LINK}>
        Move to cart
      </button>
      <button type="button" disabled={pending} onClick={() => run(() => cart.setQuantity(asin, 0), "Removed")} className={LINK}>
        Delete
      </button>
    </>
  );
}
