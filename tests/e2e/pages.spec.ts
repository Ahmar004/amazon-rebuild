import { expect, test } from "@playwright/test";
import { newShopper, register, trackErrors } from "./support";

const ROUTES = [
  "/", "/search?k=headphones", "/search?category=books", "/deals", "/cart", "/checkout", "/orders", "/wishlist", "/history",
  "/account", "/account?tab=addresses", "/account?tab=payments", "/account?tab=orders", "/customer-service",
  "/seller", "/seller/listings", "/seller/listings/new", "/seller/orders", "/seller/orders?tab=delivered",
];

// C9, C20: every page loads, has no console errors and never scrolls sideways, at both widths
// (this file runs in the desktop and mobile projects).
test("every page loads cleanly without horizontal scroll", async ({ page }) => {
  await register(page, newShopper());
  await page.goto("/search?k=headphones");
  const product = (await page.locator("main a[href^='/product/']").first().getAttribute("href"))!;

  for (const path of [...ROUTES, product]) {
    const errors = trackErrors(page);
    const response = await page.goto(path);
    await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("footer").first(), path).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0);
    expect(errors, path).toEqual([]);
    page.removeAllListeners("pageerror");
    page.removeAllListeners("console");
  }

  const missing = await page.goto("/no-such-page");
  expect(missing?.status()).toBe(404);
});
