// Every internal route and every link to a real amazon.com page, in one place, per
// CLAUDE.md's "Links to Amazon features we don't build ... URLs live in one constants module."
// Values captured against the live site on 2026-09-19 (see docs/spec.md / global-constraints.md).

export type NavLink = {
  label: string;
  href: string;
  external: boolean;
};

export const ROUTES = {
  home: "/",
  search: "/s",
  signIn: "/ap/signin",
  register: "/ap/register",
  account: "/your-account",
  orders: "/your-orders",
  cart: "/cart",
  lists: "/lists",
  history: "/history",
  deals: "/deals",
  customerService: "/customer-service",
} as const;

export const SUBNAV_LINKS: NavLink[] = [
  { label: "Prime Video", href: "https://www.amazon.com/Amazon-Video/b/?node=2858778011", external: true },
  { label: "Coupons", href: "https://www.amazon.com/coupons", external: true },
  { label: "Customer Service", href: ROUTES.customerService, external: false },
  { label: "Today's Deals", href: ROUTES.deals, external: false },
  { label: "Registry", href: "https://www.amazon.com/registries", external: true },
  { label: "Gift Cards", href: "https://www.amazon.com/gift-cards/b/?node=2238192011", external: true },
  { label: "Sell", href: "https://sell.amazon.com/", external: true },
  {
    label: "Disability Customer Support",
    href: "https://www.amazon.com/gp/help/customer/accessibility",
    external: true,
  },
];

export const ACCOUNT_FLYOUT: { lists: NavLink[]; account: NavLink[] } = {
  lists: [
    { label: "Create a List", href: ROUTES.lists, external: false },
    { label: "Find a List or Registry", href: "https://www.amazon.com/registries", external: true },
  ],
  account: [
    { label: "Account", href: ROUTES.account, external: false },
    { label: "Orders", href: ROUTES.orders, external: false },
    { label: "Recommendations", href: "https://www.amazon.com/gp/yourstore", external: true },
    { label: "Browsing History", href: ROUTES.history, external: false },
    { label: "Watchlist", href: "https://www.amazon.com/gp/video/mystuff/watchlist", external: true },
    { label: "Video Purchases & Rentals", href: "https://www.amazon.com/gp/video/mystuff", external: true },
    { label: "Kindle Unlimited", href: "https://www.amazon.com/kindle-dbs/ku/ku-central", external: true },
    { label: "Content & Devices", href: "https://www.amazon.com/hz/mycd/myx", external: true },
    { label: "Subscribe & Save Items", href: "https://www.amazon.com/auto-deliveries", external: true },
    {
      label: "Memberships & Subscriptions",
      href: "https://www.amazon.com/hz/mycd/myx#/home/settings/payment",
      external: true,
    },
    { label: "Music Library", href: "https://music.amazon.com/my/library", external: true },
  ],
};

export const SIDE_MENU_PROGRAMS: NavLink[] = [
  { label: "Today's Deals", href: ROUTES.deals, external: false },
  { label: "Gift Cards", href: "https://www.amazon.com/gift-cards/b/?node=2238192011", external: true },
  { label: "Amazon Live", href: "https://www.amazon.com/live", external: true },
  {
    label: "International Shopping",
    href: "https://www.amazon.com/international-shopping/b/?node=16857165011",
    external: true,
  },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Get to Know Us",
    links: [
      { label: "Careers", href: "https://www.amazon.jobs/", external: true },
      { label: "Blog", href: "https://www.aboutamazon.com/news", external: true },
      { label: "About Amazon", href: "https://www.aboutamazon.com/", external: true },
      { label: "Investor Relations", href: "https://ir.aboutamazon.com/", external: true },
      {
        label: "Amazon Devices",
        href: "https://www.amazon.com/amazon-devices/b/?node=2102313011",
        external: true,
      },
      { label: "Amazon Science", href: "https://www.amazon.science/", external: true },
    ],
  },
  {
    title: "Make Money with Us",
    links: [
      { label: "Sell products on Amazon", href: "https://sell.amazon.com/", external: true },
      { label: "Sell on Amazon Business", href: "https://sell.amazon.com/amazon-business", external: true },
      { label: "Sell apps on Amazon", href: "https://developer.amazon.com/", external: true },
      { label: "Become an Affiliate", href: "https://affiliate-program.amazon.com/", external: true },
      { label: "Advertise Your Products", href: "https://advertising.amazon.com/", external: true },
      { label: "Self-Publish with Us", href: "https://kdp.amazon.com/", external: true },
      { label: "Host an Amazon Hub", href: "https://thehub.amazon.com/", external: true },
      {
        label: "› See More Make Money with Us",
        href: "https://www.amazon.com/b/?node=18190131011",
        external: true,
      },
    ],
  },
  {
    title: "Amazon Payment Products",
    links: [
      { label: "Amazon Business Card", href: "https://www.amazon.com/dp/B07984JN3L", external: true },
      { label: "Shop with Points", href: "https://www.amazon.com/b/?node=16218619011", external: true },
      { label: "Reload Your Balance", href: "https://www.amazon.com/dp/B0CHTVMXZJ", external: true },
      {
        label: "Amazon Currency Converter",
        href: "https://www.amazon.com/b/?node=388305011",
        external: true,
      },
    ],
  },
  {
    title: "Let Us Help You",
    links: [
      { label: "Your Account", href: ROUTES.account, external: false },
      { label: "Your Orders", href: ROUTES.orders, external: false },
      {
        label: "Shipping Rates & Policies",
        href: `${ROUTES.customerService}/shipping`,
        external: false,
      },
      {
        label: "Returns & Replacements",
        href: `${ROUTES.customerService}/returns`,
        external: false,
      },
      {
        label: "Manage Your Content and Devices",
        href: "https://www.amazon.com/hz/mycd/myx",
        external: true,
      },
      { label: "Help", href: ROUTES.customerService, external: false },
    ],
  },
];

export const FOOTER_BRANDS: { name: string; tagline: string; href: string }[] = [
  { name: "Amazon Music", tagline: "Stream millions of songs", href: "https://music.amazon.com/" },
  {
    name: "Amazon Ads",
    tagline: "Reach customers wherever they spend their time",
    href: "https://advertising.amazon.com/",
  },
  { name: "6pm", tagline: "Score deals on fashion brands", href: "https://www.6pm.com/" },
  { name: "AbeBooks", tagline: "Books, art & collectibles", href: "https://www.abebooks.com/" },
  { name: "ACX", tagline: "Audiobook Publishing Made Easy", href: "https://www.acx.com/" },
  { name: "Sell on Amazon", tagline: "Start a Selling Account", href: "https://sell.amazon.com/" },
  {
    name: "Veeqo",
    tagline: "Shipping Software Inventory Management",
    href: "https://www.veeqo.com/",
  },
  {
    name: "Amazon Business",
    tagline: "Everything For Your Business",
    href: "https://www.amazon.com/business",
  },
  {
    name: "AmazonGlobal",
    tagline: "Ship Orders Internationally",
    href: "https://www.amazon.com/international-shopping/b/?node=16857165011",
  },
  {
    name: "Amazon Web Services",
    tagline: "Scalable Cloud Computing Services",
    href: "https://aws.amazon.com/",
  },
  {
    name: "Audible",
    tagline: "Listen to Books & Original Audio Performances",
    href: "https://www.audible.com/",
  },
  {
    name: "Box Office Mojo",
    tagline: "Find Movie Box Office Data",
    href: "https://www.boxofficemojo.com/",
  },
  { name: "Goodreads", tagline: "Book reviews & recommendations", href: "https://www.goodreads.com/" },
  { name: "IMDb", tagline: "Movies, TV & Celebrities", href: "https://www.imdb.com/" },
  {
    name: "IMDbPro",
    tagline: "Get Info Entertainment Professionals Need",
    href: "https://pro.imdb.com/",
  },
  {
    name: "Kindle Direct Publishing",
    tagline: "Indie Digital & Print Publishing Made Easy",
    href: "https://kdp.amazon.com/",
  },
  {
    name: "Prime Video Direct",
    tagline: "Video Distribution Made Easy",
    href: "https://videodirect.amazon.com/",
  },
  { name: "Shopbop", tagline: "Designer Fashion Brands", href: "https://www.shopbop.com/" },
  { name: "Woot!", tagline: "Deals and Shenanigans", href: "https://www.woot.com/" },
  { name: "Zappos", tagline: "Shoes & Clothing", href: "https://www.zappos.com/" },
  { name: "Ring", tagline: "Smart Home Security Systems", href: "https://ring.com/" },
  { name: "eero WiFi", tagline: "Stream 4K Video in Every Room", href: "https://eero.com/" },
  { name: "Blink", tagline: "Smart Security for Every Home", href: "https://blinkforhome.com/" },
  {
    name: "Neighbors App",
    tagline: "Real-Time Crime & Safety Alerts",
    href: "https://ring.com/neighbors-app",
  },
  {
    name: "Amazon Subscription Boxes",
    tagline: "Top subscription boxes - right to your door",
    href: "https://www.amazon.com/b/?node=15215888011",
  },
  { name: "PillPack", tagline: "Pharmacy Simplified", href: "https://www.pillpack.com/" },
];

export const FOOTER_LEGAL: NavLink[] = [
  {
    label: "Conditions of Use",
    href: "https://www.amazon.com/gp/help/customer/display.html?nodeId=508088",
    external: true,
  },
  {
    label: "Privacy Notice",
    href: "https://www.amazon.com/gp/help/customer/display.html?nodeId=468496",
    external: true,
  },
  {
    label: "Consumer Health Data Privacy Disclosure",
    href: "https://www.amazon.com/gp/help/customer/display.html?nodeId=TTFAPMEGYB8Y2LYT",
    external: true,
  },
  {
    label: "Your Ads Privacy Choices",
    href: "https://www.amazon.com/privacyprefs",
    external: true,
  },
];

export const MOBILE_LINK_ROW: NavLink[] = [
  { label: "Deals", href: ROUTES.deals, external: false },
  { label: "Lists", href: ROUTES.lists, external: false },
  { label: "Video", href: "https://www.amazon.com/Amazon-Video/b/?node=2858778011", external: true },
  { label: "Music", href: "https://music.amazon.com/", external: true },
  { label: "Best Sellers", href: `${ROUTES.search}?sort=bestsellers`, external: false },
  { label: "New Releases", href: `${ROUTES.search}?sort=newest`, external: false },
];
