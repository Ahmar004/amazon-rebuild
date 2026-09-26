"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPaymentIntent, finalizeOrder, quoteCheckout, type QuoteCheckoutResult } from "@/actions/checkout";
import { AddressModal } from "@/components/checkout/AddressModal";
import { AddressStep } from "@/components/checkout/AddressStep";
import { NEW_CARD_ID, PaymentStep } from "@/components/checkout/PaymentStep";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { DeliveryStep } from "@/components/checkout/DeliveryStep";
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

// The one-page checkout (C12): address, delivery speed and payment side by side with a live order
// summary. Every total shown comes from quoteCheckout; the payment
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
  const [updating, setUpdating] = useState(false);

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
    setUpdating(true);
    quoteCheckout({ addressId, speed, buy })
      .then((result) => {
        if (!cancelled) setQuote(result);
      })
      .finally(() => {
        if (!cancelled) setUpdating(false);
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

  const blocker = !addressId
    ? "Add a delivery address to place your order."
    : !selectedPaymentId
      ? "Choose a payment method to place your order."
      : null;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-fg">Checkout</h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-4">
          <AddressStep
            addresses={addressList}
            selectedId={addressId}
            onSelect={handleAddressSelect}
            onAddNew={handleAddNew}
            onEdit={handleEditAddress}
          />

          <DeliveryStep
            speed={speed}
            onSpeedChange={setSpeed}
            standardDate={quote.standardDate}
            fastDate={quote.fastDate}
            standardShippingCents={quote.standardShippingCents}
            fastShippingCents={quote.fastShippingCents}
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

          <SmallPrint />
        </div>

        <div className="lg:sticky lg:top-4">
          <OrderSummary
            items={items}
            totals={quote.totals}
            blocker={blocker}
            placing={placing}
            updating={updating}
            error={checkoutError}
            onPlaceOrder={handlePlaceOrder}
          />
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
