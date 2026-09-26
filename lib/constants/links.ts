// Every internal route and navigation link, in one place. Shopeedo links only to its own pages
// (frontend-rebuild.md points 2 and 10): there are no external storefront links anywhere.

export type NavLink = {
  label: string;
  href: string;
};

export const ROUTES = {
  home: "/",
  search: "/s",
  signIn: "/ap/signin",
  register: "/ap/register",
  account: "/your-account",
  orders: "/your-orders",
  cart: "/cart",
  checkout: "/checkout",
  lists: "/lists",
  history: "/history",
  deals: "/deals",
  customerService: "/customer-service",
} as const;

export const BEST_SELLERS_HREF = `${ROUTES.search}?sort=bestsellers`;
export const NEW_RELEASES_HREF = `${ROUTES.search}?sort=newest`;

// The quick links next to the All menu. Pages still to come (deals, customer service) are added
// here by the slice that builds them, so no link ever points at a missing page.
export const SUBNAV_LINKS: NavLink[] = [
  { label: "Best Sellers", href: BEST_SELLERS_HREF },
  { label: "New Releases", href: NEW_RELEASES_HREF },
  { label: "Your Orders", href: ROUTES.orders },
];

export const SIDE_MENU_TRENDING: NavLink[] = [
  { label: "Best Sellers", href: BEST_SELLERS_HREF },
  { label: "New Releases", href: NEW_RELEASES_HREF },
];

export const ACCOUNT_LINKS: NavLink[] = [
  { label: "Your Orders", href: ROUTES.orders },
  { label: "Your Cart", href: ROUTES.cart },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Best Sellers", href: BEST_SELLERS_HREF },
      { label: "New Releases", href: NEW_RELEASES_HREF },
      { label: "All products", href: ROUTES.search },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Your Orders", href: ROUTES.orders },
      { label: "Your Cart", href: ROUTES.cart },
    ],
  },
];
