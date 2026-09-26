import { ROUTES } from "@/lib/constants/links";

// Home page content settings (frontend-rebuild.md C6). The hero slides are our own designed
// panels: copy lives here, and the product photos on each slide come from the database.

export type HeroTone = "teal" | "indigo" | "ember" | "plum" | "ocean";

export type HeroSlideConfig = {
  key: string;
  /** Category whose most-rated products fill the slide; null means the top deals. */
  categorySlug: string | null;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  href: string;
  tone: HeroTone;
};

const categoryHref = (slug: string) => `${ROUTES.search}?i=${slug}`;

export const DEALS_HREF = ROUTES.deals;

export const HERO_SLIDES: HeroSlideConfig[] = [
  {
    key: "deals",
    categorySlug: null,
    eyebrow: "Today's Deals",
    headline: "Big savings, refreshed every day",
    subline: "Hand-picked discounts across every category.",
    cta: "Shop deals",
    href: DEALS_HREF,
    tone: "ember",
  },
  {
    key: "electronics",
    categorySlug: "electronics",
    eyebrow: "Electronics",
    headline: "Tech that keeps up with you",
    subline: "Headphones, chargers, smart home and more.",
    cta: "Explore electronics",
    href: categoryHref("electronics"),
    tone: "indigo",
  },
  {
    key: "home-kitchen",
    categorySlug: "home-kitchen",
    eyebrow: "Home & Kitchen",
    headline: "Make every room feel new",
    subline: "Cookware, storage and decor our shoppers love.",
    cta: "Refresh your home",
    href: categoryHref("home-kitchen"),
    tone: "teal",
  },
  {
    key: "fashion",
    categorySlug: "fashion",
    eyebrow: "Clothing, Shoes & Jewelry",
    headline: "Fresh fits for the season",
    subline: "Everyday styles at everyday prices.",
    cta: "Shop the looks",
    href: categoryHref("fashion"),
    tone: "plum",
  },
  {
    key: "toys",
    categorySlug: "toys",
    eyebrow: "Toys & Games",
    headline: "Play starts here",
    subline: "Top-rated games, puzzles and building sets.",
    cta: "Find a gift",
    href: categoryHref("toys"),
    tone: "ocean",
  },
];

export const HERO_IMAGES_PER_SLIDE = 3;
export const HERO_AUTOPLAY_MS = 6000;
export const RAIL_SIZE = 16;
export const CATEGORY_RAIL_SIZE = 12;
