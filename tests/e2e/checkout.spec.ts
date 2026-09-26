import { expect, test } from "@playwright/test";
import { addToCartFromProductPage, newShopper, openFirstResult, orderIdFromThankYou, payAtCheckout, register, trackErrors } from "./support";

// C12, C16: a real Stripe test-mode payment, the order in Your Orders, its timeline, then a
// cancel that refunds the card and restocks.
test("checkout, orders and cancel", async ({ page }) => {
  const errors = trackErrors(page);
  await register(page, newShopper());
  await openFirstResult(page, "notebook");
  const title = (await page.getByRole("heading", { level: 1 }).textContent())!.trim().slice(0, 25);
  const drawer = await addToCartFromProductPage(page);
  await drawer.getByRole("link", { name: /checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await payAtCheckout(page);
  const orderId = await orderIdFromThankYou(page);

  // The cart is empty after the order.
  await page.goto("/cart");
  await expect(page.getByText(/cart is empty/i).first()).toBeVisible();

  await page.goto("/orders");
  await expect(page.getByText(orderId).first()).toBeVisible();
  await page.goto(`/orders/${orderId}`);
  await expect(page.getByText(title).first()).toBeVisible();
  await expect(page.getByRole("list", { name: "Delivery progress" }).or(page.getByLabel("Delivery progress")).first()).toBeVisible();

  await page.getByRole("button", { name: "Cancel order" }).click();
  await page.getByRole("button", { name: "Yes, cancel order" }).click();
  await expect(page.getByText(/Order cancelled/).first()).toBeVisible({ timeout: 30_000 });
  await page.reload();
  await expect(page.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
  await expect(page.getByText(/Cancelled/).first()).toBeVisible();

  await page.goto("/orders?tab=cancelled");
  await expect(page.getByText(orderId).first()).toBeVisible();

  // The address used at checkout is saved to the account.
  await page.goto("/account?tab=addresses");
  await expect(page.getByText("410 Terry Ave N").first()).toBeVisible();
  expect(errors).toEqual([]);
});

// Buy now pays for one item without touching the cart (spec 5.8).
test("buy now leaves the cart alone", async ({ page }) => {
  const errors = trackErrors(page);
  await register(page, newShopper());
  await openFirstResult(page, "water bottle");
  await addToCartFromProductPage(page);
  await page.keyboard.press("Escape");

  await openFirstResult(page, "phone case");
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page).toHaveURL(/\/checkout\?buy=/);
  await payAtCheckout(page);
  const orderId = await orderIdFromThankYou(page);

  await page.goto("/cart");
  await expect(page.getByText(/cart is empty/i)).toHaveCount(0);

  // Tidy up: cancel, so the stock goes back.
  await page.goto(`/orders/${orderId}`);
  await page.getByRole("button", { name: "Cancel order" }).click();
  await page.getByRole("button", { name: "Yes, cancel order" }).click();
  await expect(page.getByText(/Order cancelled/).first()).toBeVisible({ timeout: 30_000 });
  expect(errors).toEqual([]);
});
