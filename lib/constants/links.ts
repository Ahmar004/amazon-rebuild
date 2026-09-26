// Every internal route and navigation link, in one place. Shopeedo links only to its own pages
// (frontend-rebuild.md points 2 and 10): there are no external storefront links anywhere.

export type NavLink = {
  label: string;
  href: string;
};

// Clean, readable paths (frontend-rebuild.md C13).
export const ROUTES = {
  home: "/",
  search: "/search",
  product: "/product",
  signIn: "/signin",
  register: "/register",
  account: "/account",
  orders: "/orders",
  cart: "/cart",
  checkout: "/checkout",
  wishlist: "/wishlist",
  history: "/history",
  deals: "/deals",
  customerService: "/customer-service",
  sellerDashboard: "/seller",
  sellerListings: "/seller/listings",
  sellItem: "/seller/listings/new",
} as const;

// Pages anyone can open without signing in (point 12: everything else needs an account).
export const PUBLIC_PATHS: string[] = [ROUTES.signIn, ROUTES.register];

export function productHref(asin: string): string {
  return `${ROUTES.product}/${encodeURIComponent(asin)}`;
}

export function editListingHref(asin: string): string {
  return `${ROUTES.sellerListings}/${encodeURIComponent(asin)}/edit`;
}

export const BEST_SELLERS_HREF = `${ROUTES.search}?sort=bestsellers`;
export const NEW_RELEASES_HREF = `${ROUTES.search}?sort=newest`;

// The quick links next to the All menu. Only pages that exist are linked.
export const SUBNAV_LINKS: NavLink[] = [
  { label: "Today's Deals", href: ROUTES.deals },
  { label: "Best Sellers", href: BEST_SELLERS_HREF },
  { label: "New Releases", href: NEW_RELEASES_HREF },
  { label: "Your Orders", href: ROUTES.orders },
  { label: "Customer Service", href: ROUTES.customerService },
];

// The quick links in Selling mode (D4). Buying mode shows SUBNAV_LINKS.
export const SELLER_LINKS: NavLink[] = [
  { label: "Seller dashboard", href: ROUTES.sellerDashboard },
  { label: "Your listings", href: ROUTES.sellerListings },
  { label: "Sell an item", href: ROUTES.sellItem },
];

// The header's Orders menu offers both sides in either mode (D4).
export const ORDERS_MENU: (NavLink & { description: string })[] = [
  { label: "Buyer", description: "Things you ordered", href: ROUTES.orders },
  { label: "Seller", description: "Your sales and listings", href: ROUTES.sellerDashboard },
];

export const SIDE_MENU_TRENDING: NavLink[] = [
  { label: "Today's Deals", href: ROUTES.deals },
  { label: "Best Sellers", href: BEST_SELLERS_HREF },
  { label: "New Releases", href: NEW_RELEASES_HREF },
];

export const ACCOUNT_LINKS: NavLink[] = [
  { label: "Your account", href: ROUTES.account },
  { label: "Your Orders", href: ROUTES.orders },
  { label: "Your Wishlist", href: ROUTES.wishlist },
  { label: "Browsing history", href: ROUTES.history },
  { label: "Your Cart", href: ROUTES.cart },
  { label: "Seller dashboard", href: ROUTES.sellerDashboard },
  { label: "Your listings", href: ROUTES.sellerListings },
  { label: "Customer Service", href: ROUTES.customerService },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Today's Deals", href: ROUTES.deals },
      { label: "Best Sellers", href: BEST_SELLERS_HREF },
      { label: "New Releases", href: NEW_RELEASES_HREF },
      { label: "All products", href: ROUTES.search },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Account settings", href: ROUTES.account },
      { label: "Your Orders", href: ROUTES.orders },
      { label: "Your Wishlist", href: ROUTES.wishlist },
      { label: "Your Cart", href: ROUTES.cart },
      { label: "Customer Service", href: ROUTES.customerService },
    ],
  },
  {
    title: "Sell on Shopeedo",
    links: [
      { label: "Seller dashboard", href: ROUTES.sellerDashboard },
      { label: "Sell an item", href: ROUTES.sellItem },
      { label: "Your listings", href: ROUTES.sellerListings },
    ],
  },
];
