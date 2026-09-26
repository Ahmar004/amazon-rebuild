# Shopeedo - Product Spec

This is the single source of truth for what the product does. `docs/requirements.md` is the verbatim original brief, and `frontend-rebuild.md` (root) holds the client's changed brief and the approved rebuild points (1-13, C1-C22) this spec is written from. How things are built lives in `docs/tech-stack.md` and `docs/design.md`.

## 1. The assignment

- Built for an 8x technical assessment. The first brief was a working amazon.com rebuild in 24 hours. On 2026-09-26 the client changed it: keep the idea and the backend, but design the interface ourselves and show which parts of the reference we would change, cut or improve. The product is called **Shopeedo** and never names Amazon in its code or UI.
- Judged on **speed**, **product judgement** and **UX and UI**.
- Hand-in: the live link (https://shopeedo.vercel.app/), the public repo (https://github.com/Ahmar004/amazon-rebuild), and a walkthrough video of five minutes at most, camera on. `README.md` has the design decisions that the video follows.
- **Agent capture:** `.agent-logs/` stays in the repo and is committed together with the code it produced. Log entries are never edited or deleted (`CAPTURE-TEST.md`).

## 2. Product decisions

| Topic | Decision |
|---|---|
| Market | US shoppers: prices in USD, US addresses (State, ZIP code). English only, so there is no language or locale picker. |
| Catalogue | About 12,000 real products in 24 categories with 36k reviews, from the public Amazon Reviews 2023 dataset, filtered to items with a price and an image. Product photos load from the dataset's image URLs. The marketplace name is scrubbed from all catalogue text (`lib/catalogue/store-name.ts`). |
| Accounts | Every page except sign-in and register needs an account, so checkout never interrupts a purchase with a sign-in step and the free database tier isn't spent on anonymous traffic. Email and password only. |
| Payment | Stripe in test mode, cards only. Card entry is Stripe's own field, so card numbers never touch our server. Test card 4242 4242 4242 4242. |
| Links | Every link goes to a Shopeedo page. There are no links to other sites and no placeholder links. |
| Brand | Our own "Shopeedo" SVG wordmark and lucide icons. A "clean modern retail" design system: cream light theme (default) and a GitHub-style dark theme, one teal accent, rounded cards, soft shadows. |
| Demo notice | One line in the footer and at checkout: "Shopeedo is a demo store built for an 8x assessment. Payments run in Stripe test mode." The card field adds the test card number. Every page is noindex. |
| Order status | Worked out from the order's age (section 6.4). Orders can be cancelled until they ship. |
| Ads | No sponsored placements; rails show real catalogue items. |
| Live URL | The free `vercel.app` address (roadmap Rule 0.3). |

## 3. Scope

Built (every item works end to end): layout shell with the All menu and theme toggle; home; search; product page; wishlist; cart drawer and cart page; one-page checkout; orders list and order details with cancel; account with profile, addresses, cards and orders; buyer-only reviews; browsing history; Today's Deals; Customer Service with contact requests.

Cut on purpose: multiple lists (one wishlist instead), the language and locale pickers, the header "Deliver to" popup (ZIP is chosen on the product page and at checkout), the full-page "Added to cart" interstitial (replaced by the drawer), links out to sister businesses, sellers and multiple offers, sponsored ads, returns processing (a return is requested through Customer Service), review photos and videos, email and phone verification codes, and adding a card outside checkout (cards are saved at checkout).

## 4. Domain vocabulary

Use these terms in code, UI copy and docs, and no synonyms: **product, category, brand, review, rating, cart, cart item, saved item, order, order item, address, payment method, wishlist, browsing history, deal, support request, user**.

## 5. Screens and behaviour

One fluid, desktop-first layout scales down to phones; there are no separate mobile components and no fixed minimum width. Every screen has skeleton loading, empty and error states, labelled inputs, visible focus, and keyboard use (Enter submits, Esc closes dialogs and sheets).

### 5.1 Layout shell

- **Sticky header:** All menu, logo, search bar (its own row under 768px), theme toggle, account menu (name, email, account links, Sign out), wishlist with count, Orders, and the cart button with count.
- **Quick links row:** Today's Deals, Best Sellers, New Releases, Your Orders, Customer Service.
- **All menu:** a left sheet with the same content on every page: Trending, every category, and the account links.
- **Footer:** Shop, Your account and Categories columns, "Back to top", and the demo notice. Checkout has a minimal header ("Secure checkout") and a compact footer.
- **Search suggestions:** typing shows matching product titles; Enter or the search button runs the search in the chosen category.

### 5.2 Sign in and register

- One screen each: `/signin` (email and password) and `/register` (name, email, password). Show-password toggles replace a "confirm password" field. Errors show per field.
- After signing in, the shopper returns to the page that sent them (`return_to`).

### 5.3 Home

- An animated hero carousel of designed slides: clicking the left or right 25% of the slide moves to the previous or next slide, the middle opens it; swipe, autoplay with a progress dot, and a pause button (no autoplay under reduced motion).
- Category tiles, then "Recently viewed" and "Buy again" rails (hidden when empty), then Today's Deals, Best Sellers and one rail per category. Every card has Add to cart and a wishlist heart. Sections fade in as they scroll into view.

### 5.4 Search

- A responsive product-card grid, 24 per page, with sort (Featured, Price low to high and high to low, Avg. Customer Review, Newest Arrivals, Best Sellers).
- A filter rail (rating, brand, price range, category, deals only) beside the grid; on phones the filters open in a bottom sheet. An "applied filters" chip bar with "Clear all" sits above the results. Filters live in the URL.

### 5.5 Product page

- Gallery on the left (thumbnails, zoom, full-screen viewer, share link) and a sticky purchase panel on the right: price and savings, delivery estimate for the chosen ZIP, stock, quantity, Add to cart, Buy now, wishlist heart.
- Overview / Specs / Reviews tabs; the tab lives in the URL hash. Reviews have a star histogram that filters the list.
- "You might also like" and related-product rails.

### 5.6 Wishlist

- One wishlist. The heart on every card and the product page toggles it instantly and rolls back with a toast if the server refuses. `/wishlist` lists the items with price-drop notes and Add to cart.

### 5.7 Cart

- **Cart drawer:** Add to cart on the product page slides the drawer open; quick-add on a card shows a toast with "View cart". The drawer shows the free-shipping progress bar, each line with a quantity stepper and Remove, the subtotal, Checkout and "View full cart". Quantities and the header count change instantly and roll back if the server refuses.
- **`/cart`:** lines with stepper, Delete, Save for later and Share; the free-shipping bar; "Saved for later" with Move to cart; the subtotal box and Proceed to checkout.

### 5.8 Checkout

- One page: **1 Delivery address** (saved addresses or the address form), **2 Delivery speed** (Standard or Fast, each with its date and fee), **3 Payment** (saved cards or Stripe's card field with "Save this card"), beside a sticky **order summary** with the items, the quoted totals and "Place order - $X". The summary says what is still missing when the order can't be placed yet.
- **Buy now** opens checkout for that product and quantity only; the rest of the cart stays.
- **Placing the order:** Stripe confirms the payment; only then does the server re-read the PaymentIntent and create the order, reduce stock and clear the purchased cart items in one transaction. A declined card shows Stripe's message and no order is created.
- **Confirmation page** with the delivery date, address, items and "View order details".

### 5.9 Orders

- **`/orders`:** tabs for All orders, Not yet delivered and Cancelled, a search by product or order number, and cards with the date, total, recipient, order number, a status badge and the items.
- **`/orders/[id]`:** the Ordered > Shipped > Out for delivery > Delivered timeline with dates (expected dates for steps not reached), "Cancel order" with an inline confirmation while it hasn't shipped, the items with "Buy it again" (and "Write a review" once delivered), the address, the card's last 4 digits and the totals.

### 5.10 Account

- **`/account`** with tabs in the URL: **Profile & security** (name, email, password change that needs the current password), **Addresses** (Add address tile, Edit, Remove, Set as default), **Payment methods** (saved cards with Remove and Set as default), **Orders** (the five latest orders).

### 5.11 Reviews, browsing history, deals

- **Reviews:** the Reviews tab shows the form only to a shopper with a non-cancelled order containing the product and no earlier review of it. New reviews carry "Verified purchase" and update the rating on the server.
- **Browsing history:** product views are recorded (the latest 100 per user), shown as the home "Recently viewed" rail and on `/history` with remove per item and a two-step "Clear all".
- **Today's Deals:** discounted products with the discount badge, category chips and paging.

### 5.12 Customer Service

- Shortcuts for the three latest orders (Track, Get help, Cancel while allowed); searchable help topics with topic chips; a "Contact us" form (topic, optional order, subject, message) saved as a support request; and the shopper's own requests with Open or Resolved status and "Mark as resolved".

## 6. Business rules

### 6.1 Money

- All money is stored in integer cents and calculated on the server only. The client displays server values and never computes a charged amount.

### 6.2 Shipping and delivery dates

- **Free Standard delivery** on orders with an items subtotal of $35 or more. Below $35, Standard costs $6.99 per order. The cart shows how far the shopper is from the threshold.
- **Fast delivery** costs $9.99 per order, whatever the subtotal.
- Standard arrives 5 days after the order date and Fast arrives 2 days after, shown as weekday names ("Tuesday, Sep 29").

### 6.3 Tax

Estimated tax is the items subtotal multiplied by the delivery state's base sales tax rate from a fixed per-state table, labelled "Estimated".

### 6.4 Order status timeline

Status comes from the time since the order was placed, so nothing runs in the background:

| When | Status | Cancellable |
|---|---|---|
| Under 1 hour after placing | Ordered | Yes |
| From 1 hour until the delivery date | Shipped | No |
| On the delivery date, before 6 pm | Out for delivery | No |
| From 6 pm on the delivery date | Delivered | No |

Times use the server's clock in UTC. Cancelling refunds the Stripe payment first, then marks the order cancelled and puts the stock back in one transaction.

### 6.5 Accounts and auth

- Email is unique and case-insensitive. The password is at least 6 characters and stored hashed.
- The session lives in a secure, http-only cookie. Signed-out visitors are sent to `/signin` with a return path; API routes answer 401.
- Authorisation is enforced on the server for every user-owned resource: a user can only read or change their own cart, orders, addresses, payment methods, wishlist, reviews, browsing history and support requests.

### 6.6 Stock

- "Only N left in stock - order soon." shows when stock is 10 or fewer. Quantity selectors are capped at stock and at 30. Out-of-stock products show "Currently unavailable" and can't be added to the cart.

### 6.7 Reviews

- Only buyers can review: the server checks for a non-cancelled order containing the product, allows one review per product, and marks it "Verified purchase". A product's rating combines the dataset's figures with our users' reviews.

## 7. Quality bar

- The live site works for anyone who registers, with no localhost dependency.
- **Every visible control works:** it goes to a built page or runs its action. There are no dead links and no placeholder buttons.
- **Actions feel instant:** cart and wishlist changes are optimistic with rollback, and every action confirms with a toast.
- **Pages load fast:** catalogue pages are cached and personal data streams in behind skeletons.
