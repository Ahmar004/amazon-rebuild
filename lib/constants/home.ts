import { ROUTES } from "@/lib/constants/links";

// Home page content settings (frontend-rebuild.md C6). The hero slides are our own designed
// panels: copy lives here, and the product photos on each slide come from the database.

export type HeroTone = "teal" | "indigo" | "ember" | "plum" | "ocean";

export type HeroSlideConfig = {
  key: string;
  /** Department whose most-rated products fill the slide; null means the top deals. */
  departmentSlug: string | null;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  href: string;
  tone: HeroTone;
};

const departmentHref = (slug: string) => `${ROUTES.search}?i=${slug}`;

export const DEALS_HREF = ROUTES.deals;

export const HERO_SLIDES: HeroSlideConfig[] = [
  {
    key: "deals",
    departmentSlug: null,
    eyebrow: "Today's Deals",
    headline: "Big savings, refreshed every day",
    subline: "Hand-picked discounts across every department.",
    cta: "Shop deals",
    href: DEALS_HREF,
    tone: "ember",
  },
  {
    key: "electronics",
    departmentSlug: "electronics",
    eyebrow: "Electronics",
    headline: "Tech that keeps up with you",
    subline: "Headphones, chargers, smart home and more.",
    cta: "Explore electronics",
    href: departmentHref("electronics"),
    tone: "indigo",
  },
  {
    key: "home-kitchen",
    departmentSlug: "home-kitchen",
    eyebrow: "Home & Kitchen",
    headline: "Make every room feel new",
    subline: "Cookware, storage and decor our shoppers love.",
    cta: "Refresh your home",
    href: departmentHref("home-kitchen"),
    tone: "teal",
  },
  {
    key: "fashion",
    departmentSlug: "fashion",
    eyebrow: "Clothing, Shoes & Jewelry",
    headline: "Fresh fits for the season",
    subline: "Everyday styles at everyday prices.",
    cta: "Shop the looks",
    href: departmentHref("fashion"),
    tone: "plum",
  },
  {
    key: "toys",
    departmentSlug: "toys",
    eyebrow: "Toys & Games",
    headline: "Play starts here",
    subline: "Top-rated games, puzzles and building sets.",
    cta: "Find a gift",
    href: departmentHref("toys"),
    tone: "ocean",
  },
];

export const HERO_IMAGES_PER_SLIDE = 3;
export const HERO_AUTOPLAY_MS = 6000;
export const RAIL_SIZE = 16;
export const DEPARTMENT_RAIL_SIZE = 12;
