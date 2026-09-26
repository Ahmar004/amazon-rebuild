
## New requirements by client (8x hiring team):

1) Your own design to showcase your skills in design, product thinking and product development:

        This project shall have an interface you designed yourself. Keep your idea (Amazon clone) and your backend as it is, and rebuild the frontend with your own layout and visual design. 

2) Real & Fully Functional Backend:

        The backend has to be real and connected: a working database and API, not mock data or hardcoded responses. We have implemented Neon DataBase so far as well as stripe, but we have some missing functionalities that are yet to be completed.

3) Make it your own:

        Use the product as your reference, not your blueprint. A pixel-for-pixel copy tells us very little. Show us through your design what you would change, what you would cut and how you would make it better to use. We want to see how you take inspiration and make product decisions.


### I have analyzed the frontend of the clone version we have built so far, here are some of my suggestions:

1) Change the product name to "Shopeedo" to avoid making the web app look like a potential scam (Google safe browsing had also added a dangerous label to our previous domain, because it looked like a scam as we cloned the Amazon website exactly 100%.) The app shall not have the name "Amazon" anywhere in the code/UI.

2) Remove links to Amazon's other products anywhere in the app, like the "Prime Video" link in the sub header and various other links in the footer.

3) Do corner rounding for cards and prompts

4) Add a lot more items to the database, so search and browsing experience is almost like real. Explore different datasets and discuss with me on this. We need to provide a real User experience, and avoid having dummy data or any hardcoding, currently we have lesser data in our neon database, discuss with me on how much more can we add to avoid any cost expenses at Neon.

5) The home page is a bit static and scroll-based, we have to add advanced animations to make it look interesting and attractive. 

6) Add an option for a theme toggle button on the top bar, the dark theme shall be inspired directly by the GitHub's default dark theme of dark blueish color.

7) Make the light theme as default when page loads, and shift light theme to a cream color (rather than white) for the background and a whitish color for the cards and so on.

8) On the homepage, at the very top, on each side of the page, the arrow vertical card should not display as grey when mouse hovers over it, if user clicks under the 25% of the whole image region from left, swipe to left image, and if user clicks under the 25% of whole image region from right, swipe to the right image.

9) When a user clicks a tab under the "All" side bar options, user lands on the respective page, but then if user opens the "All" sidebar again, it only shows "Trending" and no other option. The sidebar of "All" should remain consistent across all tabs of the website

10) No link inside the code/UI should point or reach to Amazon, Shopeedo is inspired from Amazon, but not a clone of Amazon. For example, currently Gift cards under the "All" side-bar reaches to the original Amazon website's gift cards page.

11) All pages/options/tabs shall be fully functional, there shall be no undone work, like for example currently "Customer Service" is not implemented and that page just shows a popup that it has not been implemented as yet. 

12) Currently, both this clone version as well as Amazon allows users to view and navigate Amazon wihtout signing in, we shall enforce sign-in and register for shopeedo for these two reasons: 1) we have limited Database resources, 2) Currently, an unsigned-in user that is about to order an item is prompted to sign-in only when they click "proceed to checkout" for an item that they might be wanting to order quickly (with as less steps as required), so the sign-in step is better off to be done in the beginning rather than during an important step of ordering an item.

13) The UI and frontend shall be scalable according to the screen size as well as the browser window size at desktop, currently, if we make the browser window size close to mobile size on desktop, the original Amazon as well as the clone doesn't scale accordingly.

### Suggested points by Claude:

Approved by the user on 2026-09-26. Numbered C1, C2 and so on so they don't clash with the user's points 1 to 13 above.

C1) Brand: our own "Shopeedo" SVG wordmark and an open-source icon set (for example lucide-react). No Amazon logo, sprites or hero images from Amazon's CDN.

C2) Design system: "clean modern retail". A small token set (neutral surfaces, one accent colour, a type scale, 4/8px spacing, soft shadows) and shared primitives (Button, Input, Card, Badge, Sheet, Toast). This replaces the ~40 Amazon colour tokens, and it applies the cream light theme and the GitHub-style dark theme from points 6 and 7.

C3) Catalogue (point 4): about 12k products across 24 departments, taken from the same Amazon Reviews 2023 dataset and filtered to products that have a price and an image. That is roughly 200-250 MB, which fits Neon's free 0.5 GB.

C4) Product photos keep loading from the dataset's image URLs. They are image sources, not links, and re-hosting them is not free at this scale. No UI text or code names Amazon.

C5) Domain: https://shopeedo.vercel.app/ is the new live URL. It shows a neutral "Shopeedo - coming soon" holding page until the rebuilt UI ships, because the Amazon-styled build could get this domain flagged too.

C6) Home page: department cards at the top, then rails of real products from the database (Today's Deals, Best Sellers, one rail per department). Signed-in users also get "Recently viewed" and "Buy again" rails. Add to cart works from a rail.

C7) Search results: a responsive product-card grid instead of Amazon's one-product-per-row list, an "applied filters" chip bar with "Clear all", and mobile filters in a bottom sheet. Filters stay in the URL.

C8) Cart: a slide-in cart drawer and a toast replace Amazon's full-page "Added to cart" page, so the shopper stays where they are. A "You're $X away from free shipping" bar is calculated on the server. The /cart page stays for full editing and saved items.

C9) Layout (point 13): the design is desktop-first, built as one fluid, responsive layout with no fixed min-width, so it scales down smoothly to narrow desktop windows and phones. This replaces the separate desktop and mobile versions (Header/HeaderMobile and so on). No bottom tab bar.

C10) Product page: the gallery on the left and one sticky purchase panel on the right (price, delivery estimate, quantity, Add to cart, Buy now, wishlist heart). Details are grouped into Overview / Specs / Reviews tabs, and the reviews have a star-filter histogram. The related-products rail stays.

C11) Sign-in on one screen (email and password together), with a show-password toggle and a Sign in / Create account switch. It's the gate from point 12, so it has to be quick.

C12) One-page checkout: address, delivery speed, payment and a live order summary all visible at once. The Stripe card field and the server-side PaymentIntent re-check don't change.

C13) Clean URLs: /signin, /register, /search, /product/[id], /orders instead of Amazon's /ap/signin, /s, /dp/[asin].

C14) Wishlist: one wishlist with a heart toggle on every product card, instead of Amazon's multiple Lists. It uses the existing lists tables.

C15) Account: one /account page with tabs for Profile & security, Addresses, Payment methods and Orders.

C16) Orders: an order details page with an Ordered > Shipped > Out for delivery > Delivered timeline, worked out from the order's age, and Cancel until the order ships.

C17) Cut the language popover and the footer locale selectors, because the store is English and USD only. The delivery ZIP is chosen on the product page and at checkout, not in a header popup.

C18) Customer Service (point 11): a searchable FAQ, shortcuts to the user's recent orders (track, cancel), and a "Contact us" form saved to a new support_requests table. Users can see their own requests and their status.

C19) Reviews: only buyers can write one. The server checks the user has a non-cancelled order containing the product, allows one review per product, shows a "Verified purchase" badge, and updates the rating on the server.

C20) Interaction states: skeleton loaders while data streams in, toasts for actions, instant (optimistic) cart and wishlist updates that roll back if the server call fails, and styled empty and error states on every screen.

C21) README gets a "Design decisions" section: what Amazon does, what Shopeedo does instead, why, and what was cut. It's also the script for the walkthrough video.

C22) Docs: rewrite the Amazon-fidelity rules in CLAUDE.md and docs/spec.md for Shopeedo, and propose new rebuild steps for roadmap.md sized for short sessions (Rule-0.0A). The user approves the exact changes to roadmap.md before they are made.
