import { expect, test } from "@playwright/test";
import { newShopper, register, trackErrors } from "./support";

// Point 12: the whole store sits behind sign-in, and auth is one screen each (C11).
test("the sign-in gate, register, sign out and sign in again", async ({ page, request }) => {
  const errors = trackErrors(page);
  const shopper = newShopper();

  await page.goto("/search?k=lamp");
  await expect(page).toHaveURL(/\/signin\?return_to=%2Fsearch%3Fk%3Dlamp/);
  expect((await request.get("/api/suggest?q=lamp")).status()).toBe(401);

  await page.getByRole("link", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/register/);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.locator("p.text-danger").first()).toBeVisible();

  await register(page, shopper, "/search?k=lamp");
  await expect(page.locator("main a[href^='/product/']").first()).toBeVisible();

  // Register again with the same email is refused.
  await page.context().clearCookies();
  await page.goto("/register");
  await page.getByLabel("Your name").fill(shopper.name);
  await page.getByLabel("Email").fill(shopper.email);
  await page.getByLabel("Password", { exact: true }).fill(shopper.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/already/i).first()).toBeVisible();

  await page.goto("/cart");
  await expect(page).toHaveURL(/\/signin\?return_to=%2Fcart/);
  await page.getByLabel("Email").fill(shopper.email);
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /incorrect/i })).toBeVisible();

  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByLabel("Password", { exact: true }).fill(shopper.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === "/cart");

  // Sign out from the account menu, then the store is gated again.
  await page.goto("/");
  await page.getByRole("button", { name: /Robin|^Account$/ }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/signin/);
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/signin\?return_to=%2Forders/);

  // An open redirect in return_to is ignored.
  await page.goto("/signin?return_to=//evil.example.com");
  await page.getByLabel("Email").fill(shopper.email);
  await page.getByLabel("Password", { exact: true }).fill(shopper.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  expect(page.url()).not.toContain("evil");

  expect(errors).toEqual([]);
});
