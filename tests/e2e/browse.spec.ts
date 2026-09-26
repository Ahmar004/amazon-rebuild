import { expect, test } from "@playwright/test";
import { newShopper, openFirstResult, register, trackErrors } from "./support";

test.beforeEach(async ({ page }) => {
  await register(page, newShopper());
});

// C6, point 9: home rails, the All menu stays complete after navigating from it.
test("home page and the All menu", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Shop by category" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Today's Deals/ }).first()).toBeVisible();
  await expect(page.locator("a[href^='/product/']").nth(20)).toBeVisible();

  const openMenu = async () => {
    await page.getByRole("button", { name: /All|Open menu/ }).first().click();
    const menu = page.getByRole("dialog", { name: "Browse Shopeedo" });
    await expect(menu).toBeVisible();
    return menu;
  };
  let menu = await openMenu();
  const links = await menu.getByRole("link").count();
  expect(links).toBeGreaterThan(24);
  await menu.getByRole("link", { name: "Books" }).click();
  await expect(page).toHaveURL(/category=books|i=books/);
  menu = await openMenu();
  await expect(menu.getByRole("link")).toHaveCount(links);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  // The theme toggle persists across a reload.
  await page.getByRole("button", { name: /Switch to dark theme/ }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});

// C7: grid results, a filter becomes a chip, "Clear all" removes it, sort stays in the URL.
test("search with filters, chips and sort", async ({ page, isMobile }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  const search = page.getByRole("textbox", { name: "Search Shopeedo" });
  await search.fill("headphones");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/search\?k=headphones/);
  await expect(page.locator("main a[href^='/product/']").nth(10)).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: /^Filters/ }).click();
    await page.getByRole("dialog", { name: "Filters" }).getByRole("link", { name: /& Up/ }).first().click();
    await expect(page).toHaveURL(/rating|stars/);
    await page.getByRole("button", { name: /^Show .* results$/ }).click();
  } else {
    await page.locator("aside").getByRole("link", { name: /& Up/ }).first().click();
  }
  const chip = page.getByRole("link", { name: /^Remove filter:/ });
  await expect(chip).toHaveCount(1);
  await page.getByRole("link", { name: "Clear all" }).click();
  await expect(chip).toHaveCount(0);
  await expect(page).toHaveURL(/k=headphones/);

  await page.getByRole("combobox", { name: "Sort by" }).selectOption({ index: 1 });
  await expect(page).toHaveURL(/sort=/);

  await page.goto("/search?k=zzqxwvnotathing");
  await expect(page.getByText(/No results/i).first()).toBeVisible();
  expect(errors).toEqual([]);
});

// C10, C14: product tabs, wishlist heart, browsing history.
test("product page tabs, wishlist and history", async ({ page }) => {
  const errors = trackErrors(page);
  const href = await openFirstResult(page, "coffee maker");
  const title = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();

  for (const tab of ["Specs", "Reviews", "Overview"]) {
    await page.getByRole("tab", { name: new RegExp(tab) }).click();
    await expect(page.getByRole("tab", { name: new RegExp(tab) })).toHaveAttribute("aria-selected", "true");
  }

  await page.getByRole("complementary").getByRole("button", { name: "Add to wishlist" }).click();
  await expect(page.getByRole("button", { name: "In your wishlist" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Wishlist (1 item)" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.goto("/wishlist");
  await expect(page.locator(`main a[href='${href}']`).first()).toBeVisible();

  await page.goto("/history");
  await expect(page.getByText(title.slice(0, 30)).first()).toBeVisible();

  await page.goto("/wishlist");
  await page.getByRole("button", { name: "Remove from wishlist" }).first().click();
  await page.reload();
  await expect(page.locator(`main a[href='${href}']`)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// Deals and Customer Service (C18): FAQ search and a contact request that lists as Open.
test("deals and customer service", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/deals");
  await expect(page.locator("main a[href^='/product/']").nth(5)).toBeVisible();

  await page.goto("/customer-service");
  await page.getByRole("searchbox", { name: "Search help topics" }).or(page.getByLabel("Search help topics")).first().fill("refund");
  await expect(page.getByText(/refund/i).first()).toBeVisible();

  const subject = `Question ${Date.now()}`;
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("combobox", { name: "What is it about?" })).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("combobox", { name: "What is it about?" }).selectOption({ index: 1 });
  await page.getByRole("textbox", { name: "Subject" }).fill(subject);
  await page.getByRole("textbox", { name: "Message" }).fill("Where can I see the delivery date for my order?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(subject)).toBeVisible();
  expect(errors).toEqual([]);
});
