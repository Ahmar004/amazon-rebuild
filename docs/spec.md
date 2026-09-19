# Amazon Rebuild - Product Spec

This is the single source of truth for what we build. It replaces `docs/requirements.md` for day-to-day work; that file stays only as the verbatim record of the brief. How things are built (stack, rendering, database, hosting) is decided in `docs/tech-stack.md` (Step-1), and how each feature is built lives in `docs/design.md` (Step-3).

## 1. The assignment

- Rebuild amazon.com as a working product in 24 hours (clock started 2026-09-19, about 20.5 hours left at the start of this spec). The clock is tracked, not enforced.
- Judged on three things: **speed** (how much working product ships in the time), **product judgement** (what was built first and what was left out), and **UX and UI** (whether it is good to use).
- Hand-in:
  - A **live link**, deployed and open to someone who is not signed in as the author.
  - A **public GitHub repo**: https://github.com/Ahmar004/amazon-rebuild
  - A **walkthrough video**: five minutes at most, camera on, with voiceover, recorded by the user.
- **Agent capture:** `.agent-logs/` must stay in the repo and be committed as we go, together with the code it produced, never in one lump. Log entries are never edited or deleted. This is already running, see `CAPTURE-TEST.md`.
- The brief allows "better than the original". We do not add features Amazon does not have; the aim is fidelity.

## 2. Product decisions (locked with the user)

| Topic | Decision |
|---|---|
| Market | amazon.com as seen by a US visitor: prices in USD, US addresses (State, ZIP code), and a default "Deliver to" of New York 10001 until the user picks a location. |
| Catalogue | A curated subset of about 500 to 1000 products from a public Amazon product dataset: real titles, prices, ratings and review counts, with images served from Amazon's image CDN. It covers the departments shown on the home page. The dataset is confirmed in Step-1, and DummyJSON is the fallback if no usable dataset exists. |
| Sign-up | Email and password only, on Amazon's own screens. No puzzle, no email code, no phone code. The README explains the omission. |
| Payment | Stripe in test mode. Card entry uses Stripe's hosted card field, so card numbers never touch our server. Judges pay with test card 4242 4242 4242 4242. |
| Unbuilt links | Amazon's header, footer and account links all stay visible. Links to pages we build go to our pages; links to other Amazon businesses and sister sites (Prime Video, Registry, Sell, Careers, IMDb and so on) open the real public site in a new tab. |
| Order status | Status comes from the order's age (section 6.4). Orders can be cancelled until they ship. |
| Extras | Lists, writing reviews, Buy Again, browsing history, and Your Addresses / Your Payments in the account area are all must-haves. |
| Ads | No sponsored placements or "Sponsored" labels. We have no advertisers, so labelling anything as sponsored would be a fake state. Amazon's related-product carousels stay, filled with real catalogue items. |

## 3. Scope ranking

Build order follows this ranking. **M** = must-have, **N** = nice-to-have (only if time remains after every M works end to end and is deployed), **O** = out of scope.

| # | Feature | Rank |
|---|---|---|
| 1 | Global header, sub-nav bar, "All" side menu, footer (desktop and mobile web) | M |
| 2 | Home page: hero carousel, category card grid, sign-in band | M |
| 3 | Search: typeahead suggestions, department filter, results page with filters, sort and pagination | M |
| 4 | Product page: gallery, buy box, carousels, product information, reviews | M |
| 5 | Cart: guest and signed-in, added-to-cart page, mini-cart, save for later | M |
| 6 | Sign in, create account, sign out | M |
| 7 | Secure checkout with Stripe test payments, Buy Now, order confirmation | M |
| 8 | Your Orders: list, time filter, order details, cancel, Buy Again tab, Not Yet Shipped tab | M |
| 9 | Your Account hub, Login & security, Your Addresses, Your Payments | M |
| 10 | Lists: Add to List, Your Lists | M |
| 11 | Write a review (star rating, headline, text) | M |
| 12 | Browsing history strip and page | M |
| 13 | "Deliver to" location popup and ZIP code modal | M |
| 14 | Today's Deals page, Customer Service help page | M |
| 15 | Language popover (English only) and footer locale selectors | M |
| 16 | Mobile web layouts for every M page | M |
| 17 | Demo account with example orders in every status, so judges can see the full order lifecycle without waiting | N |
| 18 | Spanish language, other currencies and countries | N |
| 19 | Order confirmation emails | N |
| 20 | Returns and refunds | O |
| 21 | Puzzle captcha, email and phone verification codes | O |
| 22 | Prime, Prime Video, Registry, Gift Cards, Coupons, Sell, Amazon Business, Alexa (linked out to the real sites) | O |
| 23 | Sellers, seller accounts, multiple offers per product ("2 used & new offers") | O |
| 24 | Sponsored ads and paid placements | O |
| 25 | Uploading review videos or images | O |

## 4. Domain vocabulary

Use these terms in code, UI copy and docs, and no synonyms: **product, department, brand, review, rating, cart, cart item, saved item, order, order item, address, payment method, list, list item, browsing history, deal, user**.

## 5. Screens and behaviour

The reference for each screen is the matching file in `docs/recon/`. Where the recon does not cover a detail (for example mobile layouts beyond the home page, or the "All" side menu), the live amazon.com page is the reference, checked before building it.

### 5.1 Global header (desktop)

- **Top bar, left to right:**
  - The amazon logo, linking to home.
  - "Deliver to" with the location. It shows the selected ZIP code and city, or the default.
  - The search bar: the "All" department dropdown, the query field, and the orange search button.
  - The language control (US flag and "EN").
  - "Hello, sign in" or "Hello, <first name>" over "Account & Lists".
  - "Returns & Orders".
  - Cart with the item count.
- **Search bar:**
  - Focusing it dims the page below the header (desktop only).
  - Typing shows up to 10 suggestions that match the query, with the matching part in normal weight and the rest bold.
  - Enter or the search button runs the search.
  - The department dropdown lists "All Departments" plus only departments that have products.
- **"Deliver to" popup:** on a first visit, a small popup under "Deliver to" explains which location items are shown for, with "Dismiss" and "Change Address". The choice is remembered.
- **Location modal ("Choose your location"):**
  - A signed-in user picks one of their saved addresses.
  - Anyone can enter a US ZIP code and press "Apply".
  - The chosen location sets the delivery estimates shown on product and search pages.
- **Language popover:** opens on hover or click. It shows "Change language" with English selected, "You are shopping on Amazon.com", and "Change country/region." (links out).
- **Account & Lists flyout (hover):**
  - Signed out: a yellow "Sign in" button and "New customer? Start here."
  - Always shows "Your Lists" and "Your Account" link columns.
  - Signed in: also shows "Sign Out".
- **Sub-nav bar:**
  - The "All" menu button, then these links:
    - Signed out: Today's Deals, Customer Service, and departments.
    - Signed in: the longer set, with Buy Again and departments.
  - Links that aren't built open the real Amazon page.
- **"All" side menu:**
  - Slides in from the left over a dimmed page, with "Hello, <name>" at the top.
  - Sections: Shop by Department (our departments), Programs and Features (Today's Deals, linked-out items), Help & Settings (Your Account, Customer Service, Sign in or Sign out).
  - Esc or the close button dismisses it.
- **Scroll behaviour:** on search results, scrolling down hides the header and scrolling up shows it again.

### 5.2 Footer

- A "Back to top" band that scrolls to the top.
- **Four link columns:** Get to Know Us, Make Money with Us, Amazon Payment Products, Let Us Help You.
  - Your Account, Your Orders, Shipping Rates & Policies, Returns & Replacements and Help go to our pages.
  - The rest link out.
- **Locale row:** the logo, then "English", "$ USD - U.S. Dollar" and "United States". They show the current settings; there are no alternatives to pick (section 3, #18).
- **Sister-brand grid** (Amazon Music, AbeBooks, IMDb and so on), all linking out.
- Conditions of Use, Privacy Notice, and the copyright line.
- **Auth and checkout pages** use Amazon's minimal footer instead: Conditions of Use, Privacy Notice, Help, and the copyright line.

### 5.3 Home

- **Hero carousel:** full-width, with left and right arrows and automatic rotation. Each slide links to a department or search.
- **Category card grid**, overlapping the bottom of the hero:
  - Four cards per row on desktop, two-column tiles on mobile.
  - Each card has a title (for example "Plug in with our electronics"), four image tiles with labels, and a chevron.
  - Tiles link to filtered search results.
- **"See personalized recommendations" band** (signed out only): "Sign in" and "New customer? Start here."
- **Signed-in users** see their browsing-history strip instead of the sign-in band.

### 5.4 Search results

- **Results header:** "<count> results for "<query>"" and a "Sort by" dropdown with these options: Featured, Price: Low to High, Price: High to Low, Avg. Customer Review, Newest Arrivals, Best Sellers.
- **Left filter sidebar:**
  - Customer Reviews ("4 stars & Up" and so on).
  - Brands (checkboxes, with "See more" and "See less").
  - Price (ranges plus min/max inputs).
  - Department.
  - Deals (only discounted items).
  - Filters combine and are reflected in the URL, so results can be shared and reloaded.
- **Result row:**
  - Image, brand, and a title linking to the product page.
  - Rating stars with the rating count.
  - The price in Amazon's split format (superscript cents), with a struck-through "List" or "Typical" price when discounted.
  - A delivery line ("FREE delivery <date>" or "$x.xx delivery <date>").
  - "Only N left in stock - order soon." when stock is low.
  - A yellow "Add to cart" button that adds without leaving the page and updates the cart count.
- **Below the results:** pagination, "Need help?" links, and the recommendations band.
- **Empty results:** Amazon's "No results for <query>" message with suggestions.

### 5.5 Product page

- Breadcrumb of the department path.
- **Gallery:** thumbnail strip on the left, main image, zoom on hover (desktop), "Click to see full view" opens an image viewer, and a share button that copies the link.
- **Centre column:** title, brand link, rating and count (clicking scrolls to reviews), price block (current price, list price struck through, savings percentage), "About this item" bullets.
- **Buy box:**
  - Price.
  - Delivery line and fastest delivery, both based on the chosen location.
  - "Deliver to <location>".
  - Stock status.
  - Quantity dropdown (1 up to the stock count, at most 30).
  - "Add to cart" (yellow) and "Buy Now" (orange).
  - Ships from / Sold by "Amazon.com", Returns "30-day refund/replacement", Payment "Secure transaction".
  - "Add to List" with a dropdown of the user's lists and "Create a List" (see recon `2-search-result-product-page-scroll-1.png`).
- **Carousels:** "Customers also viewed these products" and "Products related to this item". Both show real items from the same department, with paging arrows and "Page x of y".
- **Product information:** collapsible sections, "Features & Specs" and "Item details".
- **Sticky sub-nav:** appears once scrolled past the buy box (Top, About this item, Similar, Product information, Reviews), with a mini image and title.
- **Customer reviews:**
  - Average stars, "x out of 5", global rating count, and a 5-to-1 star histogram with percentages (each bar filters the reviews).
  - "Review this product" with "Write a customer review".
  - The review list: reviewer name, stars, headline, date, "Verified Purchase" badge, text, and a "Helpful" button.
  - "See more reviews".

### 5.6 Cart

- **Adding to cart** (from the product page) goes to the added-to-cart page:
  - A green check with "Added to cart", a thumbnail, and the cart subtotal.
  - "Proceed to checkout (n items)" and "Go to Cart".
  - A carousel of related products.
  - A right-side mini-cart panel: subtotal, "Go to Cart", item thumbnails with a trash / quantity / plus stepper.
- **Shopping Cart page:**
  - Each line has: image, title, stock status, "Gift options not available", the quantity stepper (trash at 1), Delete, Save for later, and Share (copies the product link).
  - "Saved for later" section, with "Move to cart" and Delete.
  - Subtotal (n items) and "Proceed to checkout".
  - A right-hand rail of related products.
  - An empty-cart state with "Your Amazon Cart is empty" and links to Today's Deals and sign-in.
- **Guest cart rules:** guests have a cart. On sign-in, the guest cart merges into the user's cart: quantities add up, capped at stock.
- **Signed-out checkout:** "Proceed to checkout" while signed out goes to sign-in, then returns to checkout.

### 5.7 Sign in and create account

- **"Sign in or create account":** a single field, "Enter mobile number or email", and "Continue". This is Amazon's own flow.
  - A known email moves to the password step: the email with "Change", then "Password" and "Sign in".
  - An unknown email moves to "Create account": the email with "Change", then "Your name", "Password (at least 6 characters)" with the hint, "Re-enter password", and "Continue".
  - A mobile number gets Amazon's "We cannot find an account with that mobile number" message, because accounts are email-only.
- **Errors inline, in Amazon's alert style:** wrong password, passwords that don't match, a password under 6 characters, a missing name, an invalid email.
- **After sign-in or sign-up,** the user returns to the page that sent them there (for example checkout).
- **Sign Out** is in the Account flyout and the side menu.

### 5.8 Secure checkout

- **Layout:** a minimal header with the logo, "Secure checkout" (a dropdown that explains how payment data is protected), and the cart link. It has no search bar.
- **Step 1, Delivery address:**
  - Pick a saved address, or use "Add a new delivery address".
  - The address modal has: Country/Region (United States), full name, phone number, street address, unit, city, State dropdown, ZIP code, "Make this my default address", and "Use this address".
  - Every field is validated.
- **Step 2, Payment method:** pick a saved card, or add a card through Stripe's card field (name on card, number, expiry, CVC). The card can be saved for later use.
- **Step 3, Review items and shipping:**
  - Each item with its image, title, price and quantity.
  - Delivery speed options per order: FREE Standard or paid Fast (section 6.2), each with its delivery date.
- **Order summary box:**
  - Items, Shipping & handling, "Total before tax", "Estimated tax to be collected", and Order total.
  - A yellow "Place your order" button.
  - All amounts come from the server.
- **The small-print block** as on Amazon ("Why has sales tax been applied?" and so on), plus "Back to cart".
- **Placing an order:**
  - The payment is confirmed through Stripe.
  - Only after a successful payment does the server create the order, reduce stock and clear the purchased items from the cart.
  - A declined card shows Stripe's error inline, and no order is created.
- **Buy Now** skips the cart and opens checkout with only that product and quantity; the rest of the cart stays as it was.
- **Confirmation page:** "Order placed, thank you!", the delivery date, the shipping address, and links to "Review or edit your recent orders".

### 5.9 Your Orders

- Breadcrumb "Your Account > Your Orders", a "Search all orders" field, and these tabs:
  - **Orders.**
  - **Buy Again:** products from past delivered orders, each with Add to cart.
  - **Not Yet Shipped.**
  - Amazon's other tabs (Digital Orders, Amazon Pay) link out.
- Filter: "<n> orders placed in" with "past 30 days", "past 3 months", and each year that has orders.
- **Order card:**
  - Header: Order placed date, Total, Ship to (name, with the full address on hover), Order # and "View order details".
  - Body: status headline ("Arriving Tuesday", "Delivered Sep 22", "Cancelled"), the items, and the actions "Buy it again", "View your item", "Cancel items" (only before shipping) and "Write a product review" (after delivery).
- **Order details page:** addresses, the payment card's last 4 digits, the item list, and the order summary.
- **Empty state:** "Looks like you haven't placed an order in the last 3 months."

### 5.10 Your Account and its pages

- **Hub grid, built:** Your Orders, Login & security, Your Addresses, Your Payments, Your Lists, Customer Service.
- **Hub grid, linked out:** Prime, Your business account, Gift cards, Your Amazon Family, Digital Services and Device Support, Your Messages. The link-list sections below the grid also link out, except items we build.
- **Login & security:** edit name, email and password. A password change needs the current password.
- **Your Addresses:** an "Add address" tile, and address cards with Edit, Remove and "Set as Default". The default is marked.
- **Your Payments:** saved cards with brand, last 4 digits, expiry, name and default status. Add a card through Stripe, remove, set as default.
- **Your Lists:** the default "Shopping List" is created on first use. Users can create, rename and delete lists; move items to cart; and remove items. Each item shows the price and the date added.

### 5.11 Browsing history

- Product pages a user opens are recorded: for guests on this device, for signed-in users on their account. Guest history merges on sign-in.
- The "Your browsing history" strip sits above the footer on most pages, with "View or edit your browsing history".
- **History page:** a grid of viewed products, newest first, with remove per item and "Remove all items".

### 5.12 Today's Deals and Customer Service

- **Today's Deals:** a grid of discounted products (list price above current price) with the discount badge, a department filter and sorting.
- **Customer Service:** Amazon's help hub layout, with topic tiles (Your Orders, Returns and Refunds, Manage Addresses, Payment Settings, Account Settings) that link to the matching pages, plus a searchable help-topics list with static articles covering our policies (section 6).

### 5.13 Mobile web

- Every M page gets a deliberate mobile layout (CLAUDE.md), not a squeezed desktop.
- **Mobile home, from the recon:**
  - Top row: hamburger, logo, "Sign in >", person icon, cart with count.
  - A full-width search bar.
  - A horizontally scrolling link row (Deals, Lists, Video, Music, Best Sellers, New Releases).
  - A "Deliver to" row.
  - The location notice with Dismiss and Change Address.
  - A hero carousel, then the "Sign in for the best experience" band with "Create an account".
  - One category card per row, each with a 2x2 image grid.
  - "Explore Departments", then a "TOP OF PAGE" bar.
- **Not covered by the recon:** other mobile pages follow the live mobile amazon.com, checked before building.

## 6. Business rules

### 6.1 Money

- All money is stored in integer cents and calculated on the server only. The client displays server values and never computes a charged amount.
- Display format is US dollars, split into dollars and superscript cents on product surfaces (for example $24.99).

### 6.2 Shipping and delivery dates

These follow Amazon US's standard non-Prime rules:
- **FREE Standard delivery** on orders with an items subtotal of $35 or more. Below $35, Standard costs $6.99 per order.
- **Fast delivery** costs $9.99 per order, whatever the subtotal.
- Standard arrives 5 days after the order date and Fast arrives 2 days after. Dates are shown as weekday names in the Amazon style ("Tuesday, Sep 29"). Product and search pages show the Standard date and, when relevant, "Or fastest delivery <Fast date>".

### 6.3 Tax

"Estimated tax to be collected" is the items subtotal multiplied by the shipping state's base sales tax rate, taken from a fixed per-state table. This approximates Amazon's real tax calculation and is labelled "Estimated" the same way.

### 6.4 Order status timeline

Status comes from the time since the order was placed, so nothing runs in the background:

| When | Status | Cancellable |
|---|---|---|
| Under 1 hour after placing | Ordered | Yes |
| From 1 hour until the delivery date | Shipped | No |
| On the delivery date, before 6 pm | Out for delivery | No |
| From 6 pm on the delivery date | Delivered | No |

Times use the server's clock in UTC.

Cancelling sets the status to Cancelled, refunds the Stripe test payment, and puts the stock back.

### 6.5 Accounts and auth

- Email is unique and case-insensitive. The password is at least 6 characters and stored hashed.
- The session lives in a secure, http-only cookie. Account, orders, checkout, lists and review pages require sign-in and redirect to sign-in with a return path.
- Authorisation is enforced on the server for every user-owned resource: a user can only read or change their own cart, orders, addresses, payment methods, lists, reviews and browsing history.

### 6.6 Stock

- Each product has a stock count. "Only N left in stock - order soon." shows when stock is 10 or fewer.
- Quantity selectors are capped at stock (and at 30). Out-of-stock products show "Currently unavailable." and cannot be added to the cart.

### 6.7 Reviews

- Signed-in users can review any product, one review per product, which they can edit or delete.
- "Verified Purchase" is shown when the reviewer has a delivered order containing that product.
- A product's average rating and rating count combine the dataset's figures with our users' reviews, so a new review moves the numbers.

## 7. Quality bar

- The live site works for anyone, signed out or signed up, with no localhost dependency.
- **Every visible control works:** it goes to a built page, links out to the real site, or runs its action. There are no dead links and no placeholder buttons.
- **Every screen has proper empty, loading and error states** in Amazon's style, plus labelled inputs, visible focus and keyboard use (Enter submits, Esc closes dialogs).
- **Pages load fast.** Catalogue pages must feel instant (Step-1 picks the rendering strategy to achieve this).

## 8. Open items for later steps

- **Step-1:** confirm the product dataset and its licence; pick the stack, rendering strategy, database, hosting and Stripe integration; decide where hero and category-card images come from.
- **Step-3:** exact routes, data model, API contracts, and the ordered slice plan.
