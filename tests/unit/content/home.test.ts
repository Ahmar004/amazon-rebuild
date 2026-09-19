import { describe, expect, it } from "vitest";
import { heroSlides, homeCards, type HomeCard } from "@/lib/content/home";

// The 12 departments this catalogue seeds (CLAUDE.md, docs/spec.md); every tile href's
// `i=` param must be one of these slugs so the search it links to returns real products.
const DEPARTMENT_SLUGS = [
  "baby",
  "beauty",
  "books",
  "fashion",
  "computers",
  "electronics",
  "home-kitchen",
  "pets",
  "sports",
  "tools",
  "toys",
  "video-games",
];

const IMAGE_HOST_PATTERN = /^https:\/\/(m\.media-amazon\.com|images-na\.ssl-images-amazon\.com)\//;

function departmentSlugFromHref(href: string): string {
  const query = href.split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  const slug = params.get("i");
  expect(slug, `href "${href}" is missing an i= department param`).toBeTruthy();
  return slug as string;
}

describe("heroSlides", () => {
  it("has at least 3 slides", () => {
    expect(heroSlides.length).toBeGreaterThanOrEqual(3);
  });

  it("every slide links internally to /s with a valid department", () => {
    for (const slide of heroSlides) {
      expect(slide.href.startsWith("/s?")).toBe(true);
      expect(DEPARTMENT_SLUGS).toContain(departmentSlugFromHref(slide.href));
    }
  });

  it("every slide image is an https amazon media URL", () => {
    for (const slide of heroSlides) {
      expect(slide.image).toMatch(IMAGE_HOST_PATTERN);
    }
  });

  it("every slide has non-empty alt text", () => {
    for (const slide of heroSlides) {
      expect(slide.alt.length).toBeGreaterThan(0);
    }
  });
});

function isTileCard(card: HomeCard): card is HomeCard & { tiles: NonNullable<HomeCard["tiles"]> } {
  return Array.isArray(card.tiles);
}

describe("homeCards", () => {
  it("has at least 16 cards", () => {
    expect(homeCards.length).toBeGreaterThanOrEqual(16);
  });

  it("every card has a non-empty title, footerLabel and internal href", () => {
    for (const card of homeCards) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.footerLabel.length).toBeGreaterThan(0);
      expect(card.href.startsWith("/s?")).toBe(true);
      expect(DEPARTMENT_SLUGS).toContain(departmentSlugFromHref(card.href));
    }
  });

  it("every tile card has exactly 4 tiles", () => {
    for (const card of homeCards.filter(isTileCard)) {
      expect(card.tiles).toHaveLength(4);
    }
  });

  it("every single-image card has an image and no tiles", () => {
    for (const card of homeCards.filter((c) => !isTileCard(c))) {
      expect(card.image).toBeTruthy();
    }
  });

  it("every tile has a non-empty label, an https amazon image and a valid /s href", () => {
    for (const card of homeCards.filter(isTileCard)) {
      for (const tile of card.tiles) {
        expect(tile.label.length).toBeGreaterThan(0);
        expect(tile.image).toMatch(IMAGE_HOST_PATTERN);
        expect(tile.href.startsWith("/s?")).toBe(true);
        expect(DEPARTMENT_SLUGS).toContain(departmentSlugFromHref(tile.href));
      }
    }
  });

  it("every single-image card's image is an https amazon media URL", () => {
    for (const card of homeCards.filter((c) => !isTileCard(c))) {
      expect(card.image).toMatch(IMAGE_HOST_PATTERN);
    }
  });
});
