# Slice 7 - Secure Checkout Implementation Plan (lean process, with a reviewer)

> One Sonnet implementer builds the slice; a Sonnet reviewer checks it (security-critical: money and payments), then the controller checks it visually. This slice completes the core purchase path.

**Goal:** Amazon's secure checkout with real Stripe test payments: delivery address (saved or new), payment method (saved card or a new card through the Stripe Payment Element), review items with delivery speed, a server-computed order summary, Place your order, Buy Now, and the order confirmation page.

**Spec:** `docs/spec.md` 5.8, 6.1-6.3, 6.5, 6.6; `docs/design.md` 4 (orders, orderItems, addresses, paymentMethods), 5.1 (tax, totals, order-id), 5.3 (orders, addresses, payments), 6.7. Recon: `docs/recon/6-*.png`. Stripe docs: fetch the current docs for the Payment Element, PaymentIntents (`confirmPayment` with `redirect: "if_required"`), `confirmCardPayment` for saved cards, and `setup_future_usage` before coding.

## Global Constraints

- Match amazon.com's checkout exactly. The live checkout needs sign-in, so use the recon screenshots as the reference. Colours only via tokens; no emojis or long dashes.
- The checkout layout has the logo at the left, "Secure checkout" plus a caret in the centre (a click opens the dropdown with the recon text), and the cart icon at the right; then `FooterMinimal` with `SafetyNotice` under the order summary box.
- **Money:** every amount comes from `computeTotals` on the server, in integer cents. The client only displays server values. `STRIPE_SECRET_KEY` is used only in `lib/stripe.ts` (server-only; import `server-only`). The publishable key comes from `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- **Order creation:** `finalizeOrder(paymentIntentId)`:
  1. Retrieves the PaymentIntent from Stripe.
  2. Requires `status === "succeeded"`, `metadata.userId === currentUser.id`, and `amount` equal to the freshly recomputed total for the same inputs (address state, speed, and the item source in the metadata).
  3. In one `withTransaction` (`lib/db/client.ts`): inserts the order (the unique `stripePaymentIntentId` makes a replay return the existing order), inserts the order items with price, title and image snapshots, decrements stock with a `stock >= qty` guard (throwing if any line fails), and deletes the purchased cart lines (a cart checkout only).
  4. If the transaction fails after a successful payment, it issues a Stripe refund and shows "Some items are no longer available" back on checkout.
- Every checkout action calls `requireUser`. Addresses and payment methods are ownership-checked in SQL.
- **TDD** for `lib/pricing/tax.ts`, `lib/pricing/totals.ts`, `lib/pricing/order-id.ts`, the address schema, and `finalizeOrder`'s guard logic: extract a pure `verifyPaymentForOrder(pi, expected)` returning a reason on failure, and test amount mismatch, a foreign user, a non-succeeded status, and success.
- Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Checkout, end to end

**Files:**
- `lib/pricing/tax.ts` (`STATE_TAX_RATES` for all 50 states + DC, base state rates; AK, DE, MT, NH, OR = 0), `lib/pricing/totals.ts`, `lib/pricing/order-id.ts`
- `lib/constants/us-states.ts`
- `lib/stripe.ts`
- `lib/data/addresses.ts`, `lib/data/payments.ts`, `lib/data/orders.ts` (`createOrderFromPayment`, `getOrder`)
- `lib/validation/address.ts`
- `actions/checkout.ts` (`quoteCheckout`, `createPaymentIntent`, `finalizeOrder`), `actions/addresses.ts` (`upsertAddress`)
- `lib/checkout/source.ts` (resolves the item source: the cart's non-saved lines, or `buy=<asin>:<qty>`)
- `app/(checkout)/layout.tsx`, `app/(checkout)/checkout/page.tsx`, `app/(checkout)/checkout/thankyou/[orderId]/page.tsx`
- `components/checkout/*`: `CheckoutHeader`, `AddressStep`, `AddressModal`, `PaymentStep`, `CardForm` (Stripe Elements), `ReviewStep`, `OrderSummary`, `SmallPrint`
- Modify: the product page Buy Now (now `/checkout?buy=<asin>:<qty>`, which requires sign-in via `return_to`); the cart and smart-wagon "Proceed to checkout" (already `/checkout`)
- Tests in `tests/unit/pricing/*`, `tests/unit/validation/address.test.ts`, `tests/unit/checkout/*.test.ts`

**Contracts:**
- `computeTotals({ lines: { unitPriceCents; quantity }[]; speed: DeliverySpeed; state: UsState }): OrderTotals`, where `OrderTotals = { itemsCents; shippingCents; beforeTaxCents; taxCents; totalCents }`. `taxCents = Math.round(itemsCents * rate)`; shipping comes from `shippingCents` (Slice 3).
- `newOrderId()` matches `/^\d{3}-\d{7}-\d{7}$/`.
- `quoteCheckout({ addressId, speed, buy? })` returns `{ totals: OrderTotals; standardDate: string; fastDate: string; standardShippingCents; fastShippingCents }`.
- `createPaymentIntent({ addressId, speed, buy?, paymentMethodId?, saveCard: boolean })` returns `{ clientSecret }`:
  - It recomputes the totals, verifies stock, and ensures a Stripe customer (stored in `users.stripeCustomerId`).
  - It creates a PaymentIntent with `amount`, `currency: "usd"`, `customer`, `metadata { userId, addressId, speed, buy }`, `automatic_payment_methods: { enabled: true, allow_redirects: "never" }`, plus `payment_method` for a saved card and `setup_future_usage: "off_session"` when `saveCard` is set.
- `finalizeOrder(paymentIntentId)` redirects to `/checkout/thankyou/<orderId>`. When a new card was saved, it stores it in `paymentMethods` (brand, last4, expiry, name, and `isDefault` if it's the first).

**Page (desktop, from 768px, recon `6-we-reach-checkout-page-after-email-verification-and-mobile-phone-verification.png` and `6-checkout-page-address-popup.png`):**
- **Left column**, three step sections on white cards (the grey page is `#f0f2f2`):
  1. "Delivery address": once chosen, a summary "Delivering to <name>" with the address and a "Change" link. While choosing: radio cards of saved addresses plus "Add a new delivery address" (a yellow pill button when there are none), opening `AddressModal` with the fields from spec 5.8 (Country/Region fixed to United States; full name; phone with the "May be used to assist delivery" hint; street address with placeholder "Street address or P.O. Box"; unit placeholder "Apt, suite, unit, building, floor, etc."; city; a State select; ZIP code; "Make this my default address"; a collapsed "Delivery instructions (optional)"; the yellow "Use this address"). The "Autofill your current location" banner is omitted (it would need geolocation plus reverse geocoding, which is out of scope).
  2. "Payment method": radio cards of saved cards ("Visa ending in 4242", name, expiry), plus "Add a credit or debit card", which reveals the Stripe Payment Element (card only, `layout: "tabs"` off) with a "Save this card for future purchases" checkbox. A test-mode hint sits under it: "Test mode: use 4242 4242 4242 4242, any future date, any CVC."
  3. "Review items and shipping": each item (image, title, price, "Qty: n"), then the delivery options as radios: "Tuesday, Sep 29 - FREE Standard Delivery" (or "$6.99 - Standard Delivery") and "Saturday, Sep 26 - $9.99 - Fast Delivery".
  4. The small-print block from the recon, and "Back to cart" (to `/cart`).
- **Right column:** a sticky order summary box: a yellow "Place your order" button (disabled until an address and payment are chosen), then "Items:", "Shipping & handling:", "Total before tax:", "Estimated tax to be collected:" and "Order total:" (bold, red, 18px). Every value comes from `quoteCheckout`; changing the address or speed re-quotes.
- **Placing the order:** the button shows a spinner and disables the page. For a new card, `stripe.confirmPayment({ elements, redirect: "if_required" })`; for a saved card, `stripe.confirmCardPayment(clientSecret, { payment_method })`. Then `finalizeOrder`. A declined card (test 4000 0000 0000 0002) shows Stripe's message inline in the payment section, and no order is created.
- **Buy Now:** `/checkout?buy=<asin>:<qty>` shows only that item and doesn't touch the cart.
- **Empty source:** redirect to `/cart`.
- **Thank-you page:** a green check + "Order placed, thank you!", "Confirmation will be sent to your email." (and it isn't sent, spec #19, so use Amazon's alternative wording "Your order has been placed."), "Delivering to <name>, <address>", the delivery date, the items thumbnails, and links "Review or edit your recent orders" (`/your-orders`) and "Continue shopping" (`/`).
- **Mobile:** single column; the order summary moves to the top with the "Place your order" button, and the steps stack below; the address modal is full-screen.

**Steps:**
- [ ] 1. Fetch the current Stripe docs (Payment Element in React, PaymentIntents, saved cards) and confirm the API names for `stripe` 22.6 and `@stripe/react-stripe-js` 6.10.
- [ ] 2. TDD tax, totals, order-id, the address schema and `verifyPaymentForOrder`. See them fail, then implement.
- [ ] 3. Implement the data layer, actions, pages and components.
- [ ] 4. Verify end to end in the browser with a new account: add an address, pay with 4242 (save the card), confirm the order row in the database (a short script), stock decreased, cart cleared; then pay again with the saved card; Buy Now; declined card 4000 0000 0000 0002 shows an error and no order; totals change with state (OR = no tax) and speed; `finalizeOrder` replayed returns the same order. Use mobile via the 390px iframe trick.
- [ ] 5. Run tests, lint, typecheck and build; commit "Slice 7: secure checkout with Stripe test payments, Buy Now, order confirmation".

Write the report to `.superpowers/sdd/2026-09-19-slice-7-checkout/report.md`.
