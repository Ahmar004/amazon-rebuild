import { describe, expect, it } from "vitest";
import {
  ACCOUNT_FLYOUT,
  FOOTER_BRANDS,
  FOOTER_COLUMNS,
  FOOTER_LEGAL,
  MOBILE_LINK_ROW,
  SIDE_MENU_PROGRAMS,
  SUBNAV_LINKS,
  type NavLink,
} from "@/lib/constants/links";

function allNavLinks(): NavLink[] {
  return [
    ...SUBNAV_LINKS,
    ...ACCOUNT_FLYOUT.lists,
    ...ACCOUNT_FLYOUT.account,
    ...SIDE_MENU_PROGRAMS,
    ...FOOTER_COLUMNS.flatMap((c) => c.links),
    ...FOOTER_LEGAL,
    ...MOBILE_LINK_ROW,
  ];
}

describe("NavLink collections", () => {
  it("every link has a non-empty label", () => {
    for (const link of allNavLinks()) {
      expect(link.label.length).toBeGreaterThan(0);
    }
  });

  it("every external link has an https href", () => {
    for (const link of allNavLinks()) {
      if (link.external) {
        expect(link.href.startsWith("https://")).toBe(true);
      }
    }
  });

  it("every internal link starts with / and not //", () => {
    for (const link of allNavLinks()) {
      if (!link.external) {
        expect(link.href.startsWith("/")).toBe(true);
        expect(link.href.startsWith("//")).toBe(false);
      }
    }
  });

  it("FOOTER_BRANDS has exactly 26 entries", () => {
    expect(FOOTER_BRANDS).toHaveLength(26);
  });

  it("FOOTER_BRANDS entries have a name, tagline and https href", () => {
    for (const brand of FOOTER_BRANDS) {
      expect(brand.name.length).toBeGreaterThan(0);
      expect(brand.tagline.length).toBeGreaterThan(0);
      expect(brand.href.startsWith("https://")).toBe(true);
    }
  });
});
