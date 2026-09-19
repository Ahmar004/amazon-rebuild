# Slice 1 - Layout Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every page of the store gets Amazon's desktop header, sub-nav, "All" side menu, Account & Lists flyout, language popover, "Deliver to" location flow, footer, and the mobile header and footer, all working.

**Architecture:** A `(shop)` route group layout renders the header and footer around every store page. Static parts are server components in the cached static shell; parts that read cookies (`DeliverTo`, greeting, cart count) stream inside `<Suspense>`. Interactive parts (popovers, drawer, modal) are small client components built on shared `Popover`, `Modal` and `useDismiss` primitives. The location change is a Server Action (`actions/location.ts`) backed by a pure, tested `lib/location.ts`.

**Tech Stack:** Next.js 16.3 App Router (`cacheComponents: true`), React 19, TypeScript strict, Tailwind 4 (tokens in `app/globals.css`), Vitest.

**Spec:** `docs/spec.md` sections 5.1, 5.2, 5.13 and 2; `docs/design.md` sections 3, 6.1, 6.10 (Location) and 9 (Slice 1).

## Global Constraints

- Match amazon.com exactly; the values in each task were measured on the live site on 2026-09-19. Font is `Arial, sans-serif` (token `--font-sans`), base 14px.
- Colours only through the Tailwind tokens in `app/globals.css` (for example `bg-nav`, `bg-subnav`, `text-link`, `bg-btn-yellow`). Add a token there if a new colour is needed; never write hex values in components.
- No emojis. No long dashes (use "-"). Icons are Amazon's sprite or inline SVG, never unicode symbols.
- Every Amazon asset URL lives in `lib/assets.ts`; every link to a real Amazon page lives in `lib/constants/links.ts`, opened with `target="_blank" rel="noopener noreferrer"`.
- Safety notice text, exactly: `Demo clone built for an 8x assessment. Not affiliated with Amazon. Do not enter real Amazon credentials.`
- Anything reading `cookies()` renders inside `<Suspense>` and never inside `'use cache'`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` before touching caching.
- Forms: real `<form>`, Enter submits, Esc closes dialogs and popovers; buttons that don't submit have `type="button"`.
- Visible focus states on every interactive element; inputs have labels (visually hidden where Amazon shows none).
- Routes that later slices build (`/ap/signin`, `/ap/register`, `/your-account`, `/your-orders`, `/cart`, `/lists`, `/history`, `/deals`, `/customer-service`, `/s`) are linked now with their final paths; they 404 until their slice lands.
- Commands: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` (the build needs `.env.local`, already present). All four must pass before a task commits.
- Commit with a clear message ending in `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`, and include any changed `.agent-logs/` files in the commit. Do not push.

---

### Task 1: Shared foundations (links, assets, location logic, UI primitives)

**Files:**
- Create: `lib/constants/links.ts`, `lib/assets.ts`, `lib/location.ts`, `hooks/useDismiss.ts`, `components/ui/Popover.tsx`, `components/ui/Modal.tsx`
- Test: `tests/unit/constants/links.test.ts`, `tests/unit/location.test.ts`

**Interfaces:**
- Produces:
  - `type NavLink = { label: string; href: string; external: boolean }`
  - `links.ts` exports: `SUBNAV_LINKS: NavLink[]`, `ACCOUNT_FLYOUT: { lists: NavLink[]; account: NavLink[] }`, `SIDE_MENU_PROGRAMS: NavLink[]`, `FOOTER_COLUMNS: { title: string; links: NavLink[] }[]`, `FOOTER_BRANDS: { name: string; tagline: string; href: string }[]`, `FOOTER_LEGAL: NavLink[]`, `MOBILE_LINK_ROW: NavLink[]`, `ROUTES` (object of internal paths: `home "/"`, `search "/s"`, `signIn "/ap/signin"`, `register "/ap/register"`, `account "/your-account"`, `orders "/your-orders"`, `cart "/cart"`, `lists "/lists"`, `history "/history"`, `deals "/deals"`, `customerService "/customer-service"`).
  - `assets.ts` exports `NAV_SPRITE` (URL), `FLAG_SPRITE` (URL), and `SPRITES` with `{ position: string; width: number; height: number }` entries: `logo`, `cart`, `hamburger`, `location`, `usFlag`.
  - `location.ts` exports `type DeliveryLocation = { zip: string; city: string; state: string }`, `DEFAULT_LOCATION`, `LOCATION_COOKIE = "deliver_to"`, `LOCATION_PROMPT_COOKIE = "loc_prompt"`, `isValidZip(zip: string): boolean`, `parseLocationCookie(value: string | undefined): DeliveryLocation`, `serializeLocation(loc: DeliveryLocation): string`, `lookupZip(zip: string, fetcher?: typeof fetch): Promise<DeliveryLocation | null>`, `formatLocation(loc: DeliveryLocation): string`.
  - `useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void)`: calls `onDismiss` on Escape keydown and on pointerdown outside `ref`.
  - `<Popover open onClose anchorClassName className>`: positioned panel with Amazon's white card, 1px border `border-border`, shadow `0 2px 4px rgba(0,0,0,.13)`, 8px radius, and a 8px upward caret. It uses `useDismiss`.
  - `<Modal open onClose title labelledBy>`: dimmed overlay (black at 60% opacity), centred white panel with Amazon's grey header bar (`#f0f2f2` token `--color-modal-header`, add it) holding the title and an X close button; focus moves into the panel on open and returns on close; Esc and overlay click close it; `role="dialog"` and `aria-modal="true"`.

- [ ] **Step 1: Write failing tests** for `lib/location.ts`:
  - `isValidZip`: accepts "10001", rejects "1000", "100011", "abcde", " 10001".
  - `parseLocationCookie`: undefined gives `DEFAULT_LOCATION` = `{ zip: "10001", city: "New York", state: "NY" }`; malformed JSON gives the default; valid JSON round-trips through `serializeLocation`.
  - `lookupZip`: with a fake fetcher returning Zippopotam's shape `{ "post code": "90210", places: [{ "place name": "Beverly Hills", "state abbreviation": "CA" }] }` it returns `{ zip: "90210", city: "Beverly Hills", state: "CA" }`; a 404 response gives `null`; an invalid ZIP gives `null` without calling the fetcher. The URL is `https://api.zippopotam.us/us/<zip>`.
  - `formatLocation`: `{ zip: "10001", city: "New York" }` gives `"New York 10001"`.
- [ ] **Step 2: Write failing tests** for `lib/constants/links.ts`: every `NavLink` in every export has a non-empty label; an `external: true` link has an `https://` href; an internal link (`external: false`) starts with `/` and not `//`; `FOOTER_BRANDS` has exactly 26 entries.
- [ ] **Step 3: Run `npm test`**; both files fail because the modules don't exist.
- [ ] **Step 4: Implement** the modules with these exact values:
  - `NAV_SPRITE = "https://m.media-amazon.com/images/G/01/gno/sprites/nav-sprite-global-1x-reorg-privacy._CB779528203_.png"`; `SPRITES.logo = { position: "-9px -125px", width: 98, height: 34 }`, `cart = { position: "-10px -340px", width: 38, height: 26 }`, `hamburger = { position: "-172px -255px", width: 17, height: 14 }`, `location = { position: "-71px -378px", width: 15, height: 18 }`.
  - `FLAG_SPRITE = "https://m.media-amazon.com/images/S/sash/MAbi1rCjQI9H2y0.png"`, `SPRITES.usFlag = { position: "0px -130px", width: 22, height: 16 }`.
  - `SUBNAV_LINKS` (order as on amazon.com): Prime Video `https://www.amazon.com/Amazon-Video/b/?node=2858778011` (external); Coupons `https://www.amazon.com/coupons` (external); Customer Service `/customer-service`; Today's Deals `/deals`; Registry `https://www.amazon.com/registries` (external); Gift Cards `https://www.amazon.com/gift-cards/b/?node=2238192011` (external); Sell `https://sell.amazon.com/` (external); Disability Customer Support `https://www.amazon.com/gp/help/customer/accessibility` (external).
  - `ACCOUNT_FLYOUT.lists`: Create a List `/lists`; Find a List or Registry `https://www.amazon.com/registries` (external). `ACCOUNT_FLYOUT.account`: Account `/your-account`; Orders `/your-orders`; Recommendations `https://www.amazon.com/gp/yourstore` (external); Browsing History `/history`; Watchlist `https://www.amazon.com/gp/video/mystuff/watchlist` (external); Video Purchases & Rentals `https://www.amazon.com/gp/video/mystuff` (external); Kindle Unlimited `https://www.amazon.com/kindle-dbs/ku/ku-central` (external); Content & Devices `https://www.amazon.com/hz/mycd/myx` (external); Subscribe & Save Items `https://www.amazon.com/auto-deliveries` (external); Memberships & Subscriptions `https://www.amazon.com/hz/mycd/myx#/home/settings/payment` (external); Music Library `https://music.amazon.com/my/library` (external).
  - `SIDE_MENU_PROGRAMS`: Today's Deals `/deals`; Gift Cards `https://www.amazon.com/gift-cards/b/?node=2238192011` (external); Amazon Live `https://www.amazon.com/live` (external); International Shopping `https://www.amazon.com/international-shopping/b/?node=16857165011` (external).
  - `FOOTER_COLUMNS`:
    - "Get to Know Us": Careers `https://www.amazon.jobs/`, Blog `https://www.aboutamazon.com/news`, About Amazon `https://www.aboutamazon.com/`, Investor Relations `https://ir.aboutamazon.com/`, Amazon Devices `https://www.amazon.com/amazon-devices/b/?node=2102313011`, Amazon Science `https://www.amazon.science/` (all external).
    - "Make Money with Us": Sell products on Amazon `https://sell.amazon.com/`, Sell on Amazon Business `https://sell.amazon.com/amazon-business`, Sell apps on Amazon `https://developer.amazon.com/`, Become an Affiliate `https://affiliate-program.amazon.com/`, Advertise Your Products `https://advertising.amazon.com/`, Self-Publish with Us `https://kdp.amazon.com/`, Host an Amazon Hub `https://thehub.amazon.com/`, "› See More Make Money with Us" `https://www.amazon.com/b/?node=18190131011` (all external).
    - "Amazon Payment Products": Amazon Business Card `https://www.amazon.com/dp/B07984JN3L`, Shop with Points `https://www.amazon.com/b/?node=16218619011`, Reload Your Balance `https://www.amazon.com/dp/B0CHTVMXZJ`, Amazon Currency Converter `https://www.amazon.com/b/?node=388305011` (all external).
    - "Let Us Help You": Your Account `/your-account`, Your Orders `/your-orders`, Shipping Rates & Policies `/customer-service/shipping`, Returns & Replacements `/customer-service/returns`, Manage Your Content and Devices `https://www.amazon.com/hz/mycd/myx` (external), Help `/customer-service`.
  - `FOOTER_BRANDS` (name, tagline, href), in this order: Amazon Music / Stream millions of songs / `https://music.amazon.com/`; Amazon Ads / Reach customers wherever they spend their time / `https://advertising.amazon.com/`; 6pm / Score deals on fashion brands / `https://www.6pm.com/`; AbeBooks / Books, art & collectibles / `https://www.abebooks.com/`; ACX / Audiobook Publishing Made Easy / `https://www.acx.com/`; Sell on Amazon / Start a Selling Account / `https://sell.amazon.com/`; Veeqo / Shipping Software Inventory Management / `https://www.veeqo.com/`; Amazon Business / Everything For Your Business / `https://www.amazon.com/business`; AmazonGlobal / Ship Orders Internationally / `https://www.amazon.com/international-shopping/b/?node=16857165011`; Amazon Web Services / Scalable Cloud Computing Services / `https://aws.amazon.com/`; Audible / Listen to Books & Original Audio Performances / `https://www.audible.com/`; Box Office Mojo / Find Movie Box Office Data / `https://www.boxofficemojo.com/`; Goodreads / Book reviews & recommendations / `https://www.goodreads.com/`; IMDb / Movies, TV & Celebrities / `https://www.imdb.com/`; IMDbPro / Get Info Entertainment Professionals Need / `https://pro.imdb.com/`; Kindle Direct Publishing / Indie Digital & Print Publishing Made Easy / `https://kdp.amazon.com/`; Prime Video Direct / Video Distribution Made Easy / `https://videodirect.amazon.com/`; Shopbop / Designer Fashion Brands / `https://www.shopbop.com/`; Woot! / Deals and Shenanigans / `https://www.woot.com/`; Zappos / Shoes & Clothing / `https://www.zappos.com/`; Ring / Smart Home Security Systems / `https://ring.com/`; eero WiFi / Stream 4K Video in Every Room / `https://eero.com/`; Blink / Smart Security for Every Home / `https://blinkforhome.com/`; Neighbors App / Real-Time Crime & Safety Alerts / `https://ring.com/neighbors-app`; Amazon Subscription Boxes / Top subscription boxes - right to your door / `https://www.amazon.com/b/?node=15215888011`; PillPack / Pharmacy Simplified / `https://www.pillpack.com/`.
  - `FOOTER_LEGAL`: Conditions of Use `https://www.amazon.com/gp/help/customer/display.html?nodeId=508088`, Privacy Notice `https://www.amazon.com/gp/help/customer/display.html?nodeId=468496`, Consumer Health Data Privacy Disclosure `https://www.amazon.com/gp/help/customer/display.html?nodeId=TTFAPMEGYB8Y2LYT`, Your Ads Privacy Choices `https://www.amazon.com/privacyprefs` (all external).
  - `MOBILE_LINK_ROW`: Deals `/deals`, Lists `/lists`, Video `https://www.amazon.com/Amazon-Video/b/?node=2858778011` (external), Music `https://music.amazon.com/` (external), Best Sellers `/s?sort=bestsellers`, New Releases `/s?sort=newest`.
- [ ] **Step 5: Run `npm test`**; all tests pass. Then run lint and typecheck.
- [ ] **Step 6: Commit** `Slice 1 task 1: links, assets, location logic, popover and modal primitives`.

### Task 2: Desktop header, sub-nav, "All" side menu, account flyout, language popover

**Files:**
- Create: `app/(shop)/layout.tsx`, `components/layout/Header.tsx`, `components/layout/SearchBar.tsx`, `components/layout/LanguagePopover.tsx`, `components/layout/AccountFlyout.tsx`, `components/layout/CartLink.tsx`, `components/layout/SubNav.tsx`, `components/layout/SideMenu.tsx`, `components/ui/Sprite.tsx`
- Move: `app/page.tsx` to `app/(shop)/page.tsx` (content unchanged; Slice 2 replaces it)

**Interfaces:**
- Consumes (Task 1): `SUBNAV_LINKS`, `ACCOUNT_FLYOUT`, `SIDE_MENU_PROGRAMS`, `ROUTES`, `NavLink`, `NAV_SPRITE`, `FLAG_SPRITE`, `SPRITES`, `Popover`, `useDismiss`; and existing `getDepartments(): Promise<{ id: number; slug: string; name: string }[]>` from `lib/data/departments.ts`.
- Produces:
  - `<Sprite name: keyof typeof SPRITES className? label?>`: a span with the sprite background at the given position and size; `aria-hidden` unless `label` is given.
  - `<Header departments={Department[]} deliverTo={ReactNode} />`: `deliverTo` is a slot filled by Task 3 (render `null` there for now).
  - `<SideMenu departments={Department[]} />`, `<SubNav departments={Department[]} />` (SubNav renders the "All" button that opens SideMenu).
  - `(shop)/layout.tsx` fetches departments once and renders `<Header>` + `<SubNav>` + `<main>{children}</main>`, with a `{/* Footer: Task 4 */}` slot position after main (Task 4 adds `<Footer>`).

Measured desktop values (amazon.com, 2026-09-19):
- **Top bar (`#nav-belt`):** height 60px, `bg-nav`, content padding about 0 10px. Items are vertically centred, each a clickable box with 1px transparent border that turns white on hover (`border-white`), 2px radius, padding about 0 9px.
- **Logo:** sprite `logo` (98x34) inside a link to `/`, with 10px top offset so the smile sits low like Amazon's; hover outline as above.
- **Deliver to:** `deliverTo` slot. Task 3 fills it.
- **Search form:** fills the remaining width; height 40px; 4px radius; focus ring is 3px `#febd69`-like orange (use token `search-btn`).
  - Left: the department select styled as Amazon's grey tab (`#e6e6e6` background token `--color-search-dept`, text `#555` 12px, 1px right border `#cdcdcd`, a small down-caret SVG). The visible label shows "All" or the selected department's short name; the real `<select name="i">` sits over it with opacity 0 so the native list opens. Options: "All Departments" (value ""), then each department (`value={slug}`).
  - Middle: `<input name="k" placeholder="Search Amazon">`, 15px, left padding 10px, with a visually hidden label "Search Amazon".
  - Right: 45x40 submit button `bg-search-btn` (hover `search-btn-hover`) with an inline SVG magnifying glass (22px, stroke `#333`), `aria-label="Go"`.
  - The form uses `action="/s"` and `method="get"` so it works without JavaScript; empty `i` is not sent (disable the select when "All" is chosen before submit, or strip it in onSubmit).
- **Language:** US flag sprite (22x16) + "EN" 14px bold + small grey caret. Hovering or clicking opens `LanguagePopover`: "Change language" (13px) + "Learn more" link (external `https://www.amazon.com/gp/help/customer/display.html?nodeId=202036240`), a checked radio row "English - EN", a divider, the US flag with "You are shopping on Amazon.com", and the link "Change country/region." (external `https://www.amazon.com/customer-preferences/country`). Only English exists (spec #18), so there is no Spanish row.
- **Account & Lists:** line 1 "Hello, sign in" (12px, `#fff`, line-height 14px); line 2 "Account & Lists" (14px, bold, line-height 15px) with a caret. Hover opens `AccountFlyout` (100ms intent delay; closes on leave, Esc, outside click):
  - Top centre: a yellow `Sign in` button (`bg-btn-yellow`, border `btn-yellow-border`, 8px radius, 200px wide) linking to `/ap/signin`, then small text "New customer? " + link "Start here." to `/ap/register`.
  - Two columns separated by a 1px divider: "Your Lists" (bold 16px) with `ACCOUNT_FLYOUT.lists`, and "Your Account" with `ACCOUNT_FLYOUT.account`; 13px links, `text-[#444]`, underline and `text-link-hover` on hover.
  - While the flyout is open, the page below the header dims (black at 50% opacity, not covering the header).
- **Returns & Orders:** line 1 "Returns" 12px, line 2 "& Orders" 14px bold; links to `/your-orders`.
- **Cart (`CartLink`):** cart sprite (38x26) with the count above the cart's basket, 18px bold `#f08804` (token `--color-cart-count`), and "Cart" 14px bold beside it; links to `/cart`. This slice renders count `0` (the cart arrives in Slice 5, whose `cartCount` then feeds this prop): `<CartLink count={number} />`.
- **Sub-nav (`#nav-main`):** height 39px, `bg-subnav`, 14px white links with the same 1px hover outline; first the "All" button (hamburger sprite 17x14 + "All" bold), then `SUBNAV_LINKS`. External links open in a new tab.
- **"All" side menu (`SideMenu`, client):**
  - A 365px-wide white drawer that slides in from the left (0.3s) over a black 80% opacity overlay, with a white "X" close button (inline SVG, 24px) floating just right of the drawer.
  - Header strip `bg-subnav`, 50px tall, with a white user-circle SVG and "Hello, sign in" 19px bold, linking to `/ap/signin`.
  - Sections separated by 5px `#d5dbdb` bars, each with an 18px bold title (padding 13px 20px 13px 36px) and 14px `#111` item rows (padding 13px 20px 13px 36px) that turn `#eaeded` on hover:
    - "Trending": Best Sellers `/s?sort=bestsellers`, New Releases `/s?sort=newest`, Movers & Shakers (external `https://www.amazon.com/gp/movers-and-shakers`).
    - "Shop by Department": every department, `/s?i=<slug>`.
    - "Programs & Features": `SIDE_MENU_PROGRAMS`.
    - "Help & Settings": Your Account `/your-account`, a row with a globe SVG + "English", a row with the US flag + "United States", Customer Service `/customer-service`, Sign in `/ap/signin`.
  - Opening locks body scroll; Esc, overlay click and the X close it; focus moves to the drawer and returns to the "All" button.

- [ ] **Step 1:** Build the components above; make `Header` and `SubNav` server components with small client islands (`SearchBar`, `LanguagePopover` trigger, `AccountFlyout` trigger, `SideMenu`).
- [ ] **Step 2:** Create `app/(shop)/layout.tsx` and move the home page into the group.
- [ ] **Step 3:** Run `npm run dev` and check at 1280px: the header matches the measurements, search submits to `/s?k=...` (404 is expected), the flyout and popover open and close with hover, click and Esc, and the side menu opens and closes. Run `npm test`, lint, typecheck and build.
- [ ] **Step 4: Commit** `Slice 1 task 2: desktop header, sub-nav, side menu, account flyout, language popover`.

### Task 3: "Deliver to" location, first-visit popup and location modal

**Files:**
- Create: `components/layout/DeliverTo.tsx` (server, reads cookies), `components/layout/DeliverToButton.tsx` (client), `components/layout/LocationPrompt.tsx` (client), `components/layout/LocationModal.tsx` (client), `actions/location.ts`
- Modify: `app/(shop)/layout.tsx` (pass `<Suspense fallback={<DeliverToFallback/>}><DeliverTo/></Suspense>` into Header's `deliverTo` slot)
- Test: `tests/unit/actions/location.test.ts`

**Interfaces:**
- Consumes (Task 1): `DeliveryLocation`, `DEFAULT_LOCATION`, `LOCATION_COOKIE`, `LOCATION_PROMPT_COOKIE`, `parseLocationCookie`, `serializeLocation`, `lookupZip`, `isValidZip`, `formatLocation`, `Modal`, `Popover`, `SPRITES.location`.
- Produces:
  - `actions/location.ts` (`"use server"`): `setLocation(zip: string): Promise<{ ok: true; location: DeliveryLocation } | { ok: false; error: string }>` validates the ZIP, calls `lookupZip`, and on success sets the `deliver_to` cookie (path `/`, 1 year, `sameSite: "lax"`, `httpOnly: false` is fine because it holds no secret) and `loc_prompt=1`; on failure returns the error `"Please enter a valid US zip code"`. `dismissLocationPrompt(): Promise<void>` sets `loc_prompt=1`.
  - `getDeliveryLocation(): Promise<DeliveryLocation>` in `lib/location-server.ts` (reads the cookie; server only). Later slices use it for delivery dates.

Behaviour and values:
- **Header block:** the location sprite (15x18), then two lines: "Deliver to" (12px, `#ccc`, line-height 14px) and `formatLocation(location)` (14px bold white, line-height 15px). The same hover outline as other header items. Clicking opens `LocationModal`. The Suspense fallback renders the same block with `DEFAULT_LOCATION`, so nothing shifts.
- **First-visit prompt:** when the `loc_prompt` cookie is absent, a small white popover sits under "Deliver to" (caret pointing at it; 13px text; width about 330px): "We're showing you items that ship to **New York 10001**. To see items that ship to a different address, change your delivery address." Below it, right-aligned, a white rounded "Dismiss" button and a yellow rounded "Change Address" button (8px radius). Dismiss calls `dismissLocationPrompt`; Change Address opens the modal. **(design choice: Amazon's Pakistan wording adapted to a US location)**
- **Location modal:** title "Choose your location" in the grey header bar; body text (13px, `#565959`) "Delivery options and delivery speeds may vary for different locations".
  - Signed out (always, in this slice): a full-width yellow button "Sign in to see your addresses" linking to `/ap/signin`.
  - Then a divider with "or enter a US zip code" and a row: a 5-character input (`inputMode="numeric"`, `maxLength={5}`, label "or enter a US zip code") and a white "Apply" button. They form one `<form>`, so Enter applies.
  - Errors show under the row in Amazon's red (`#c40000` as token `--color-error`): "Please enter a valid US zip code".
  - On success the modal closes and the header shows the new location (call `router.refresh()`).
  - A yellow "Done" button closes the modal.
- [ ] **Step 1: Write failing tests** for `setLocation`, mocking `next/headers` `cookies()` and the fetcher: an invalid ZIP returns the error without a lookup; an unknown ZIP (lookup `null`) returns the error; a good ZIP sets both cookies and returns the location. Run and see them fail.
- [ ] **Step 2: Implement** the action, `lib/location-server.ts`, and the components; wire the slot.
- [ ] **Step 3:** In the dev server: a first visit shows the prompt; Dismiss hides it for good; Change Address and the header block open the modal; 90210 gives "Beverly Hills 90210"; 00000 shows the error; Esc closes. Run tests, lint, typecheck and build.
- [ ] **Step 4: Commit** `Slice 1 task 3: deliver-to location, first-visit prompt and location modal`.

### Task 4: Footer, minimal footer, safety notice, not-found page, mobile header and footer

**Files:**
- Create: `components/layout/Footer.tsx`, `components/layout/FooterMinimal.tsx`, `components/layout/SafetyNotice.tsx`, `components/layout/HeaderMobile.tsx`, `components/layout/FooterMobile.tsx`, `app/not-found.tsx`, `components/layout/BackToTop.tsx` (client, smooth-scrolls to top)
- Modify: `app/(shop)/layout.tsx` (render `HeaderMobile` below 768px and `Header` + `SubNav` from 768px, using `md:hidden` / `hidden md:block`; add `Footer` from 768px and `FooterMobile` below it)

**Interfaces:**
- Consumes (Task 1-3): `FOOTER_COLUMNS`, `FOOTER_BRANDS`, `FOOTER_LEGAL`, `MOBILE_LINK_ROW`, `ROUTES`, `Sprite`, `SideMenu` (reused by the mobile hamburger), `CartLink`, the `DeliverTo` Suspense block, `SearchBar`.
- Produces: `<SafetyNotice className? />` (a single line of 11px `text-text-muted` centred text with the exact notice, used here and by the auth and checkout layouts in later slices); `<FooterMinimal />` (for the auth and checkout layouts in later slices).

Values (recon `docs/recon/footer-*.png`, `1_initial-home-page-desktop-scroll-7.png`, `-8.png`):
- **Back to top:** a full-width `bg-back-to-top` bar, 50px, centred "Back to top" 13px white; hover a slightly lighter shade (`#485769`, token `--color-back-to-top-hover`).
- **Link columns:** `bg-subnav`; four columns centred with about 110px gaps; titles 16px bold white; links 14px `#ddd` (token `--color-footer-link`), line-height 18px, 10px apart, underline on hover.
- **Locale row:** separated by a 1px `#3a4553` line: the white Amazon logo (inline SVG or the logo sprite on dark), then three bordered boxes (1px `#848688`, 3px radius, 13px `#ccc`): a globe SVG + "English" with an up/down caret, "$ USD - U.S. Dollar", and the US flag + "United States". They are display-only (spec #18), so render them as non-interactive boxes with `aria-label` text.
- **Brand grid:** `bg-footer-bottom`; a 7-column table of `FOOTER_BRANDS`, name 12px `#ddd` and tagline 12px `#999`, both inside one link.
- **Legal row:** `FOOTER_LEGAL` links 12px `#ddd` with 20px gaps, then "© 1996-2026, Amazon.com, Inc. or its affiliates" 12px, then `SafetyNotice` (on the dark background use `#999` text).
- **`FooterMinimal`:** white background, a top gradient divider line, then centred links "Conditions of Use", "Privacy Notice", "Help" (11px `text-link`), the copyright line, and `SafetyNotice`.
- **Not found (`app/not-found.tsx`):** Amazon's page: the logo, the heading "Sorry! We couldn't find that page. Try searching or go to Amazon's home page." with "Amazon's home page" linking to `/`, and a search box (reuse `SearchBar` with an empty department list) plus the dog image `https://m.media-amazon.com/images/G/01/error/title._TTD_.png` (add it to `lib/assets.ts`).
- **Mobile header (below 768px, recon `docs/recon/mobile-app-views-captured`, first screenshot):**
  - Row 1 (48px, `bg-nav`): hamburger (opens `SideMenu`), the logo sprite, then right-aligned "Sign in ›" (14px white, link `/ap/signin`), a person-outline SVG, and the cart sprite with count.
  - Row 2: a full-width search field (height 44px, 8px radius, white, `bg-search-btn` magnifier button on the right, no department select), submitting to `/s`.
  - Row 3: a horizontally scrolling row of `MOBILE_LINK_ROW` (14px white, no wrap, hidden scrollbar) on `bg-subnav`.
  - Row 4: the location row on `bg-back-to-top`: a pin SVG + "Deliver to " + `formatLocation(...)` + a small caret; tapping opens `LocationModal`. It reuses the `DeliverTo` Suspense data.
- **Mobile footer:** a full-width "TOP OF PAGE" bar (`bg-back-to-top`, 13px, with a small up-caret above the text); then on `bg-subnav` two centred link columns (Your Account, Your Orders, Customer Service, Today's Deals from `ROUTES`), "English" and "United States" rows, `FOOTER_LEGAL` 11px, the copyright, and `SafetyNotice`.
- [ ] **Step 1:** Build the components and wire them into the layout.
- [ ] **Step 2:** Check in the dev server at 1280px and 390px: the footer matches the recon; "Back to top" scrolls up; every footer link resolves (internal paths or external new tabs); the mobile header and footer render only below 768px and the desktop ones only from 768px; `/nonexistent` shows the not-found page. Run tests, lint, typecheck and build.
- [ ] **Step 3: Commit** `Slice 1 task 4: footer, mobile header and footer, safety notice, not-found page`.
