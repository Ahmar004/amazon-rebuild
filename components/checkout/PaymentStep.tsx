"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { CardForm, type ConfirmCardResult } from "@/components/checkout/CardForm";
import type { PaymentMethod } from "@/lib/data/payments";

/** Sentinel selectedId meaning "add a new card" rather than an existing saved card's id. */
export const NEW_CARD_ID = "new";

type PaymentStepProps = {
  paymentMethods: PaymentMethod[];
  selectedId: string | null;
  onSelectSaved: (id: string) => void;
  onSelectNew: () => void;
  stripePromise: Promise<Stripe | null>;
  /** Set once CheckoutClient has a fresh PaymentIntent for the new-card flow; null while loading. */
  clientSecret: string | null;
  /** True once a delivery address is chosen - the new-card form needs one to quote totals. */
  addressChosen: boolean;
  saveCard: boolean;
  onSaveCardChange: (value: boolean) => void;
  onCardReady: (confirm: () => Promise<ConfirmCardResult>) => void;
  error: string | null;
};

// Step 2 of checkout (docs/spec.md 5.8): saved cards as radio cards, plus "Add a credit or debit
// card", which reveals the Stripe Payment Element (CardForm) once CheckoutClient has created a
// PaymentIntent for the current address/speed/totals.
export function PaymentStep({
  paymentMethods,
  selectedId,
  onSelectSaved,
  onSelectNew,
  stripePromise,
  clientSecret,
  addressChosen,
  saveCard,
  onSaveCardChange,
  onCardReady,
  error,
}: PaymentStepProps) {
  return (
    <section className="rounded-lg bg-surface p-4">
      <h2 className="text-lg font-bold text-fg">Payment method</h2>

      <div role="radiogroup" aria-label="Payment method" className="mt-3 space-y-2">
        {paymentMethods.map((pm) => (
          <label
            key={pm.id}
            className={`flex cursor-pointer gap-2 rounded border p-3 text-sm text-fg ${
              selectedId === pm.id ? "border-accent" : "border-border"
            }`}
          >
            <input
              type="radio"
              name="payment"
              className="mt-1 shrink-0"
              checked={selectedId === pm.id}
              onChange={() => onSelectSaved(pm.id)}
            />
            <span>
              <span className="capitalize">{pm.brand}</span> ending in {pm.last4}
              <br />
              {pm.nameOnCard}
              <br />
              Expires {String(pm.expMonth).padStart(2, "0")}/{pm.expYear}
            </span>
          </label>
        ))}

        <label
          className={`flex cursor-pointer gap-2 rounded border p-3 text-sm text-fg ${
            selectedId === NEW_CARD_ID ? "border-accent" : "border-border"
          }`}
        >
          <input
            type="radio"
            name="payment"
            className="mt-1 shrink-0"
            checked={selectedId === NEW_CARD_ID}
            onChange={onSelectNew}
          />
          <span>Add a credit or debit card</span>
        </label>
      </div>

      {selectedId === NEW_CARD_ID && (
        <>
          {!addressChosen ? (
            <p className="mt-3 text-sm text-fg-muted">Choose a delivery address to enter card details.</p>
          ) : clientSecret ? (
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
              <CardForm onReady={onCardReady} saveCard={saveCard} onSaveCardChange={onSaveCardChange} />
            </Elements>
          ) : (
            <p className="mt-3 text-sm text-fg-muted">Loading payment form...</p>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
