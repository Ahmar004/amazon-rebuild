"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPaymentIntent, finalizeOrder, quoteCheckout, type QuoteCheckoutResult } from "@/actions/checkout";
import { AddressModal } from "@/components/checkout/AddressModal";
import { AddressStep } from "@/components/checkout/AddressStep";
import { NEW_CARD_ID, PaymentStep } from "@/components/checkout/PaymentStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { SmallPrint } from "@/components/checkout/SmallPrint";
import type { ConfirmCardResult } from "@/components/checkout/CardForm";
import { getStripe } from "@/lib/stripe-client";
import type { Address } from "@/lib/data/addresses";
import type { PaymentMethod } from "@/lib/data/payments";
import type { CheckoutSourceLine } from "@/lib/checkout/source";
import type { DeliverySpeed } from "@/lib/pricing/shipping";

type CheckoutClientProps = {
  items: CheckoutSourceLine[];
  buy?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  defaultAddressId: string | null;
  defaultPaymentMethodId: string | null;
  initialQuote: QuoteCheckoutResult;
};

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Composes the three checkout steps and the order summary (docs/superpowers/plans/
// 2026-09-19-slice-7-checkout.md). Every total shown comes from quoteCheckout; the payment
// confirmation and order creation follow the plan's "Placing the order" section exactly:
// a new card confirms through the Stripe Elements Payment Element (CardForm), a saved card
// confirms with stripe.confirmCardPayment, then finalizeOrder creates the order server-side.
export function CheckoutClient({
  items,
  buy,
  addresses,
  paymentMethods,
  defaultAddressId,
  defaultPaymentMethodId,
  initialQuote,
}: CheckoutClientProps) {
  const [stripePromise] = useState(() => getStripe());

  const [addressList, setAddressList] = useState(addresses);
  const [addressId, setAddressId] = useState(defaultAddressId);
  const [speed, setSpeed] = useState<DeliverySpeed>("standard");
  const [quote, setQuote] = useState(initialQuote);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    defaultPaymentMethodId ?? (paymentMethods.length === 0 ? NEW_CARD_ID : null),
  );
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const newCardConfirmRef = useRef<(() => Promise<ConfirmCardResult>) | null>(null);
  const handleCardReady = useCallback((confirm: () => Promise<ConfirmCardResult>) => {
    newCardConfirmRef.current = confirm;
  }, []);

  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    let cancelled = false;
    quoteCheckout({ addressId, speed, buy }).then((result) => {
      if (!cancelled) setQuote(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId, speed]);

  const newCardIntentKey = useRef<string | null>(null);
  useEffect(() => {
    if (selectedPaymentId !== NEW_CARD_ID || !addressId) return;

    const key = `${addressId}:${speed}`;
    if (newCardIntentKey.current === key) return;
    newCardIntentKey.current = key;

    let cancelled = false;
    setClientSecret(null);
    createPaymentIntent({ addressId, speed, buy, saveCard }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setClientSecret(result.clientSecret);
      } else {
        setCheckoutError(result.error);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentId, addressId, speed]);

  function handleAddressSelect(id: string) {
    setAddressId(id);
    setCheckoutError(null);
  }

  function handleAddNew() {
    setEditingAddress(null);
    setAddressModalOpen(true);
  }

  function handleEditAddress(address: Address) {
    setEditingAddress(address);
    setAddressModalOpen(true);
  }

  function handleAddressSaved(address: Address) {
    setAddressList((prev) => {
      const withoutDup = prev.filter((a) => a.id !== address.id);
      return [address, ...withoutDup];
    });
    setAddressId(address.id);
    setAddressModalOpen(false);
    setEditingAddress(null);
  }

  function handleSelectSavedPayment(id: string) {
    setSelectedPaymentId(id);
    setPaymentError(null);
  }

  function handleSelectNewPayment() {
    setSelectedPaymentId(NEW_CARD_ID);
    setPaymentError(null);
  }

  async function handlePlaceOrder() {
    if (!addressId || !selectedPaymentId) return;

    setPlacing(true);
    setPaymentError(null);
    setCheckoutError(null);

    let confirmResult: ConfirmCardResult;

    if (selectedPaymentId === NEW_CARD_ID) {
      if (!newCardConfirmRef.current) {
        setPaymentError("Payment form is not ready yet. Please try again.");
        setPlacing(false);
        return;
      }
      confirmResult = await newCardConfirmRef.current();
    } else {
      const intentResult = await createPaymentIntent({
        addressId,
        speed,
        buy,
        paymentMethodId: selectedPaymentId,
        saveCard: false,
      });
      if (!intentResult.ok) {
        setCheckoutError(intentResult.error);
        setPlacing(false);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        setCheckoutError(GENERIC_ERROR);
        setPlacing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentResult.clientSecret);
      if (error) {
        confirmResult = { ok: false, error: error.message ?? "Your card was declined." };
      } else if (paymentIntent) {
        confirmResult = { ok: true, paymentIntentId: paymentIntent.id };
      } else {
        confirmResult = { ok: false, error: GENERIC_ERROR };
      }
    }

    if (!confirmResult.ok) {
      setPaymentError(confirmResult.error);
      setPlacing(false);
      return;
    }

    const outcome = await finalizeOrder(confirmResult.paymentIntentId);
    // finalizeOrder redirects on success and never returns; a returned value means it failed.
    if (outcome) {
      setCheckoutError(outcome.error);
      setPlacing(false);
    }
  }

  const summary = (
    <OrderSummary
      totals={quote.totals}
      disabled={!addressId || !selectedPaymentId}
      placing={placing}
      error={checkoutError}
      onPlaceOrder={handlePlaceOrder}
    />
  );

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="order-first lg:order-last lg:sticky lg:top-4">{summary}</div>

        <div className="order-last space-y-4 lg:order-first">
          <AddressStep
            addresses={addressList}
            selectedId={addressId}
            onSelect={handleAddressSelect}
            onAddNew={handleAddNew}
            onEdit={handleEditAddress}
          />

          <PaymentStep
            paymentMethods={paymentMethods}
            selectedId={selectedPaymentId}
            onSelectSaved={handleSelectSavedPayment}
            onSelectNew={handleSelectNewPayment}
            stripePromise={stripePromise}
            clientSecret={clientSecret}
            addressChosen={Boolean(addressId)}
            saveCard={saveCard}
            onSaveCardChange={setSaveCard}
            onCardReady={handleCardReady}
            error={paymentError}
          />

          <ReviewStep
            items={items}
            speed={speed}
            onSpeedChange={setSpeed}
            standardDate={quote.standardDate}
            fastDate={quote.fastDate}
            standardShippingCents={quote.standardShippingCents}
            fastShippingCents={quote.fastShippingCents}
          />

          <SmallPrint />
        </div>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSaved={handleAddressSaved}
        address={editingAddress}
      />
    </div>
  );
}
