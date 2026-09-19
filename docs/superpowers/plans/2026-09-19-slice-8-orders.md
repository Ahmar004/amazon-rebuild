# Slice 8 - Your Orders Implementation Plan (lean process, with a reviewer)

> One Sonnet implementer builds the slice; a Sonnet reviewer checks it (security-critical: refunds and ownership), then the controller checks it visually.

**Goal:** Amazon's Your Orders: the order list with tabs (Orders, Buy Again, Not Yet Shipped) and the time filter, "Search all orders", order cards with the age-based status, order details, cancel with a Stripe refund and stock restore, and "Buy it again".

**Spec:** `docs/spec.md` 5.9, 6.4; `docs/design.md` 5.1 (order-status), 5.3 (orders), 6.8. Recon: `docs/recon/7-returns-&-Orders-page-from-top-bar-right-corner.png` (empty state and layout).

## Global Constraints

- Match amazon.com's Your Orders (layout from the recon; the live page needs sign-in). Colours only via tokens; no emojis or long dashes.
- `requireUser("/your-orders")` on every page and action. Every query filters by `userId` in SQL. A foreign order id gives the not-found page, never data.
- The status is always `orderStatus(order, now)` from `lib/pricing/order-status.ts` (a pure function taking `now`), never stored.
- `cancelOrder` checks ownership and `isCancellable(now)`, creates a Stripe refund for the PaymentIntent (`lib/stripe.ts`), then in one `withTransaction` sets `cancelledAt` and restores stock for each item. If the refund fails, nothing changes and the user sees "We couldn't cancel this order. Please try again."
- TDD `order-status.ts` (the boundaries: 59 minutes is ordered, 60 minutes is shipped, 17:59 UTC on the delivery date is out for delivery, 18:00 UTC is delivered, cancelled always wins) and the period filter helper. Test, lint, typecheck and build must pass. Commit with `.agent-logs/` changes, message ending `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Do not push.

## Task 1: Orders, end to end

**Files:**
- `lib/pricing/order-status.ts`, `lib/constants/order-status.ts` (the `ORDER_STATUS` enum and its labels)
- `lib/data/orders.ts` (add `listOrders`, `buyAgainProducts`, `cancelOrder`)
- `actions/orders.ts`
- `app/(shop)/your-orders/page.tsx`, `app/(shop)/your-orders/[orderId]/page.tsx`
- `components/orders/*`: `OrdersTabs`, `PeriodSelect`, `OrdersSearch`, `OrderCard`, `CancelOrderDialog`, `BuyAgainGrid`
- Tests `tests/unit/pricing/order-status.test.ts`, `tests/unit/orders/period.test.ts`

**Contracts:**
- `orderStatus({ placedAt, deliveryDate, cancelledAt }, now): "ordered" | "shipped" | "out_for_delivery" | "delivered" | "cancelled"` and `isCancellable(...same, now): boolean`.
- `listOrders(userId, { period: "30d" | "3m" | <year>; tab: "orders" | "not-yet-shipped"; q?: string })` returns orders with items. `q` matches order ids and item titles (`ILIKE`). Not Yet Shipped filters on `orderStatus === "ordered"` in code after the SQL date filter.
- `buyAgainProducts(userId): ProductSummary[]`: distinct products from delivered, non-cancelled orders.

**Look and behaviour (desktop):**
- **Header area:** the breadcrumb "Your Account › Your Orders" (`text-link` / `text-link-hover` orange current), "Your Orders" at 28px, and on the right a "Search all orders" input with a search icon and a dark rounded "Search Orders" button.
- **Tabs:** Orders, Buy Again and Not Yet Shipped are ours (orange underline on the active one); Digital Orders and Amazon Pay link out to `https://www.amazon.com/gp/css/order-history` in a new tab.
- **Period line:** "**n orders** placed in" plus a grey rounded select: "past 30 days", "past 3 months", and each year with orders, as `?period=`.
- **Order card:** a 1px `#d5d9d9` border and 8px radius.
  - Grey header row (`#f0f2f2`) with small uppercase labels: "ORDER PLACED" + date ("September 19, 2026"), "TOTAL" + $, "SHIP TO" + name (hover shows the full address in a popover), and at the right "ORDER # 113-..." with the links "View order details" and "Invoice" (Invoice opens the details page).
  - Body: the status headline, bold 18px ("Arriving Tuesday", "Shipped", "Out for delivery", "Delivered September 22", "Cancelled"), then each item (image 90px, title link, "Return or replace items: Eligible through <delivery+30d>" only when delivered) with the buttons "Buy it again" (yellow, adds to the cart with `redirectTo: "none"` and shows "Added") and "View your item".
  - Right column buttons: "Track package" (to the details page), "Cancel items" (only when `isCancellable`; opens `CancelOrderDialog` with "Cancel this order?" and the "Cancel order" / "Keep order" buttons), and "Write a product review" (only when delivered, to `/review/create-review/<asin>` for the first item).
- **Empty state (recon):** "Looks like you haven't placed an order in the last 3 months." with "View orders in 2026".
- **Order details `/your-orders/[orderId]`:** "Order Details", "Ordered on <date> | Order# <id>", then a box with three columns ("Ship to" address, "Payment method" with the card brand and "ending in 4242", "Order Summary" with Item(s) Subtotal, Shipping & Handling, Total before tax, Estimated tax, Grand Total), then the status block with items as on the card.
- **Buy Again tab:** a grid of product tiles (image, title, price, Add to cart). Empty state: "There are no recommended items for you to buy again at this time."
- **Mobile:** stacked cards; the header row becomes two lines; the tabs scroll horizontally.

**Steps:**
- [ ] 1. TDD `order-status.ts` and the period helper. See them fail, then implement.
- [ ] 2. Implement the data layer, the cancel action with the refund and transaction, and the pages and components.
- [ ] 3. Verify with real orders from Slice 7 (place two in the browser). Cancel one within the hour: the Stripe refund succeeds, the status shows Cancelled, stock is restored (check the database). To see later statuses without waiting, run a short local script that backdates one test order's `placedAt` and `deliveryDate`, and confirm the Shipped, Out for delivery and Delivered rendering, Buy Again, and the review link. Then restore the order. Try a foreign order id (not found), search, and the period filter. Use mobile via the 390px iframe trick.
- [ ] 4. Run tests, lint, typecheck and build; commit "Slice 8: your orders (tabs, period filter, search, details, cancel with refund, buy again)".

Write the report to `.superpowers/sdd/2026-09-19-slice-8-orders/report.md`.
