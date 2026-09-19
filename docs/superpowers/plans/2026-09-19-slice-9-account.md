# Slice 9 - Your Account Implementation Plan (lean process)

> One Sonnet implementer builds the slice; the controller checks it visually. Ownership checks are covered by tests (this slice doesn't get its own reviewer; the auth and checkout reviewers covered the underlying patterns).

**Goal:** Amazon's Your Account hub, Login & security (edit name, email, password), Your Addresses (add, edit, remove, set default, and use as the delivery location), and Your Payments (add a card via a Stripe SetupIntent, remove, set default).

**Spec:** `docs/spec.md` 5.10, 6.5; `docs/design.md` 6.9, 6.10 (Location). Recon: `docs/recon/Account-page-third-option-from-right-at-topbar-scroll-1..3.png`.

## Global Constraints

- Match amazon.com (hub layout from the recon). Colours only via tokens; no emojis or long dashes.
- `requireUser(...)` on every page and action; every query filters by `userId` in SQL. Changing email or password requires the current password.
- Reuse Slice 7's `lib/data/addresses.ts`, `lib/data/payments.ts`, `AddressModal` / the address form fields, `lib/validation/address.ts`, `lib/stripe.ts` and `CardForm`; don't duplicate them. Link-outs come from `lib/constants/links.ts` (add hub and link-list URLs there).
- TDD for the new validation (the name, email-change and password-change schemas) and the ownership helpers. Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Account area, end to end

**Files:**
- `app/(shop)/your-account/page.tsx`, `login-security/page.tsx`, `addresses/page.tsx`, `payments/page.tsx`
- `actions/account.ts` (`updateName`, `updateEmail`, `updatePassword`), `actions/addresses.ts` (add `deleteAddress`, `setDefaultAddress`, `useAddressAsLocation`), `actions/payments.ts` (`createSetupIntent`, `savePaymentMethod`, `removePaymentMethod`, `setDefaultPaymentMethod`)
- `lib/validation/account.ts`
- `components/account/*`

**Look and behaviour:**
- **Hub `/your-account`** (recon scroll-1..3):
  - "Your Account" (28px), then a 3-column grid of bordered cards (8px radius, hover `#f0f2f2`) with an icon (Amazon's hub icon images from the live page, recorded in `lib/assets.ts`), a 17px title and a 14px muted description, in the recon's order: Your Orders, Login & security, Prime, Your Addresses, Your business account, Gift cards, Your Payments, Your Amazon Family, Digital Services and Device Support, Your Lists, Customer Service, Your Messages.
  - Built cards link internally (Orders to `/your-orders`, Login & security, Addresses, Payments, Lists to `/lists`, Customer Service to `/customer-service`); the rest open the real Amazon page in a new tab.
  - Below, the link-list boxes (Ordering and shopping preferences, Digital content and devices, Memberships and subscriptions, Communication and content, Shopping programs and rentals, Other programs, Manage your data) with the recon's link texts. Links we build are internal ("Your Addresses", "Your Payments", "Your Orders"); all others link out.
- **Login & security:** a bordered box with rows Name, Email, Mobile number ("Add" links out, since phone is out of scope) and Password ("********"), each with an "Edit" button. Each Edit opens an inline form: Name (a required field), Email (new email plus current password; unique, else "Email address already in use"), Password (current, new of at least 6, re-enter; "Passwords must match", "Your current password is incorrect"). Show Amazon's green success alert "Your changes have been saved" after a save. The "Done" button returns to the hub.
- **Your Addresses:** a grid with a dashed "+ Add Address" tile, then address cards (the default first, labelled "Default:" in a small grey header; name bold, lines, phone) with links "Edit | Remove | Set as Default". Remove asks for confirmation ("Remove this address?"). Add and Edit use the existing address form on a page or in a modal. Each card also has "Deliver to this address", which sets the `deliver_to` location cookie from the address (via `useAddressAsLocation` with an ownership check).
- **Your Payments:** "Wallet" with card tiles ("Visa ending in 4242", name, "Expires 12/2030", a "Default" badge) and "+ Add a payment method", which calls `createSetupIntent`, mounts the Stripe Payment Element in setup mode, runs `stripe.confirmSetup({ redirect: "if_required" })`, then `savePaymentMethod(setupIntentId)`: retrieve the SetupIntent and its payment method, check the customer belongs to the user, and store brand, last4, expiry and name. Remove detaches the card in Stripe, then deletes the row; "Set as default".
- **Mobile:** the hub is a single column of cards; the forms are full width.

**Steps:**
- [ ] 1. TDD the account schemas and a `canEditAddress` / `canUsePaymentMethod` ownership helper against a fake repository or pure function. See them fail, then implement.
- [ ] 2. Implement the pages and actions.
- [ ] 3. Verify in the browser as a signed-in user: edit the name (header greeting updates), change the email and password (sign in again), add, edit, remove and set-default addresses, "Deliver to this address" updates the header, add a card (4242) and remove it; the saved card then appears in checkout. Use mobile via the 390px iframe trick.
- [ ] 4. Run tests, lint, typecheck and build; commit "Slice 9: your account hub, login & security, addresses, payments".

Write the report to `.superpowers/sdd/2026-09-19-slice-9-account/report.md`.
