"use client";

import { useEffect } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export type ConfirmCardResult = { ok: true; paymentIntentId: string } | { ok: false; error: string };

type CardFormProps = {
  /** Registers the confirm function this step's "Place your order" button calls (docs/superpowers
   * plan's "Placing the order": `stripe.confirmPayment({ elements, redirect: "if_required" })`).
   * Must live inside <Elements>, since useStripe/useElements only work there - CheckoutClient's
   * "Place order" button lives outside it, so it calls this through a ref PaymentStep exposes. */
  onReady: (confirm: () => Promise<ConfirmCardResult>) => void;
  saveCard: boolean;
  onSaveCardChange: (value: boolean) => void;
};

// The new-card entry inside the Payment method step (docs/spec.md 5.8): Stripe's Payment Element
// plus the "Save this card" checkbox and the test-mode hint.
export function CardForm({ onReady, saveCard, onSaveCardChange }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    onReady(async (): Promise<ConfirmCardResult> => {
      if (!stripe || !elements) return { ok: false, error: "Payment form is not ready yet. Please try again." };

      const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
      if (error) return { ok: false, error: error.message ?? "Your card was declined." };
      if (!paymentIntent) return { ok: false, error: "Your payment could not be confirmed." };
      return { ok: true, paymentIntentId: paymentIntent.id };
    });
  }, [stripe, elements, onReady]);

  return (
    <div className="mt-3">
      {/* Link offers bank and pay-later options that settle later; checkout only completes card payments. */}
      <PaymentElement options={{ layout: "tabs", wallets: { link: "never" } }} />

      <label className="mt-3 flex items-center gap-2 text-sm text-fg">
        <input type="checkbox" checked={saveCard} onChange={(event) => onSaveCardChange(event.target.checked)} />
        Save this card for future purchases
      </label>

      <p className="mt-2 text-xs text-fg-muted">Payments run in Stripe test mode: use 4242 4242 4242 4242, any future date, any CVC.</p>
    </div>
  );
}
