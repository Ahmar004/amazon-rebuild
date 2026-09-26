import { expect, test } from "@playwright/test";
import { addToCartFromProductPage, newShopper, openFirstResult, register, trackErrors } from "./support";

// C8, C20: the drawer opens in place, quantities change instantly, /cart edits and saves items.
test("cart drawer and the cart page", async ({ page }) => {
  const errors = trackErrors(page);
  await register(page, newShopper());
  await openFirstResult(page, "desk lamp");
  const title = (await page.getByRole("heading", { level: 1 }).textContent())!.trim().slice(0, 25);

  const drawer = await addToCartFromProductPage(page);
  await expect(drawer.getByText(title).first()).toBeVisible();
  await expect(drawer.getByText(/free shipping|FREE shipping|away from/i).first()).toBeVisible();
  await drawer.getByRole("button", { name: "Increase quantity" }).first().click();
  await expect(page.getByRole("dialog", { name: "Your cart (2)" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();

  await page.goto("/cart");
  await expect(page.getByText(title).first()).toBeVisible();
  await page.getByRole("button", { name: "Save for later" }).first().click();
  await expect(page.getByRole("button", { name: "Move to cart" }).first()).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Move to cart" }).first().click();
  await expect(page.getByRole("button", { name: "Save for later" }).first()).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText(/Your cart is empty|cart is empty/i).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Your cart is empty|cart is empty/i).first()).toBeVisible();
  expect(errors).toEqual([]);
});
