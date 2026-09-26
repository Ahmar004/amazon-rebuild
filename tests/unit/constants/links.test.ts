import { describe, expect, it } from "vitest";
import { ACCOUNT_LINKS, FOOTER_COLUMNS, productHref, ROUTES, SIDE_MENU_TRENDING, SUBNAV_LINKS, type NavLink } from "@/lib/constants/links";

function allNavLinks(): NavLink[] {
  return [...SUBNAV_LINKS, ...SIDE_MENU_TRENDING, ...ACCOUNT_LINKS, ...FOOTER_COLUMNS.flatMap((c) => c.links)];
}

describe("NavLink collections", () => {
  it("every link has a non-empty label", () => {
    for (const link of allNavLinks()) expect(link.label.length).toBeGreaterThan(0);
  });

  it("every link is internal: starts with / and not //", () => {
    for (const link of [...allNavLinks(), ...Object.values(ROUTES).map((href) => ({ label: href, href }))]) {
      expect(link.href.startsWith("/")).toBe(true);
      expect(link.href.startsWith("//")).toBe(false);
    }
  });

  it("no link leaves the site", () => {
    for (const link of allNavLinks()) expect(link.href.toLowerCase()).not.toMatch(/https?:/);
  });
});

describe("productHref", () => {
  it("builds the clean product path", () => {
    expect(productHref("B0ABC12345")).toBe("/product/B0ABC12345");
  });
});
