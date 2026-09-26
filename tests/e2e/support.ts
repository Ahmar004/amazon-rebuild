import { randomBytes } from "node:crypto";
import { expect, type Browser, type Page } from "@playwright/test";

// Every account the suite creates uses this prefix, so global-teardown.ts can remove them all.
export const E2E_EMAIL_PREFIX = "e2e-";
export const E2E_EMAIL_DOMAIN = "@shopeedo.test";

export type Shopper = { name: string; email: string; password: string };

export function newShopper(first = "Robin"): Shopper {
  const id = randomBytes(5).toString("hex");
  return { name: `${first} Tester`, email: `${E2E_EMAIL_PREFIX}${id}${E2E_EMAIL_DOMAIN}`, password: randomBytes(9).toString("base64url") };
}

// Registers through the real /register page and waits for the redirect back into the store.
export async function register(page: Page, shopper: Shopper, returnTo = "/") {
  await page.goto(`/register?return_to=${encodeURIComponent(returnTo)}`);
  await page.getByLabel("Your name").fill(shopper.name);
  await page.getByLabel("Email").fill(shopper.email);
  await page.getByLabel("Password", { exact: true }).fill(shopper.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((url) => url.pathname === new URL(returnTo, "http://x").pathname, { timeout: 30_000 });
}

// A fresh browser context with a newly registered shopper, for flows that need two people.
export async function signedInPage(browser: Browser, first: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const shopper = newShopper(first);
  await register(page, shopper);
  return { page, shopper, close: () => context.close() };
}

// Collects uncaught page errors, console errors and failed same-origin requests, so a test can
// assert there were none.
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    // Only the app's own messages: Stripe's card iframe logs its own (hCaptcha, plain-http warnings).
    // Failed requests are reported with their URL below.
    const text = m.text();
    const fromApp = !m.location().url || new URL(m.location().url).origin === new URL(page.url()).origin;
    if (m.type() === "error" && fromApp && !text.startsWith("Failed to load resource") && !text.includes("Stripe.js integration over HTTP")) errors.push(text);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url() || r.url()).origin) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
}

// Opens the first product in a search. Search result cards link to /product/<id>.
export async function openFirstResult(page: Page, query: string) {
  await page.goto(`/search?k=${encodeURIComponent(query)}`);
  const first = page.locator("main a[href^='/product/']").first();
  const href = (await first.getAttribute("href"))!;
  await page.goto(href);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  return href;
}

export async function addToCartFromProductPage(page: Page) {
  await page.locator("button[data-intent=add-to-cart]").click();
  const drawer = page.getByRole("dialog", { name: /Your cart/ });
  await expect(drawer).toBeVisible();
  return drawer;
}

// Fills the checkout page: a new address if there is none, fast delivery, then a Stripe test card.
export async function payAtCheckout(page: Page) {
  await expect(page.getByRole("heading", { name: /checkout/i }).first()).toBeVisible();
  const addAddress = page.getByRole("button", { name: /Add a delivery address|Add a new address/ });
  if (await page.getByRole("radiogroup", { name: "Delivery address" }).count() === 0) {
    await addAddress.click();
    await page.getByLabel("Full name (First and Last name)").fill("Robin Tester");
    await page.getByLabel("Phone number").fill("2065550100");
    await page.getByLabel("Street address").fill("410 Terry Ave N");
    await page.getByLabel("City").fill("Seattle");
    await page.getByLabel("State").selectOption("WA");
    await page.getByLabel("ZIP Code").fill("98109");
    await page.getByRole("button", { name: "Use this address" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.getByText("Fast delivery").click();
  const addCard = page.getByText("Add a credit or debit card");
  if (await addCard.count()) await addCard.click();
  // Stripe's iframe can drop keystrokes while it is still mounting, so check what landed and retype.
  const card = page.frameLocator('iframe[title*="Secure payment"]').first();
  const number = card.locator('input[name="number"]');
  await expect(async () => {
    await number.fill("4242424242424242");
    await expect(number).toHaveValue("4242 4242 4242 4242", { timeout: 2_000 });
  }).toPass({ timeout: 60_000 });
  await card.locator('input[name="expiry"]').fill("12 / 34");
  await card.locator('input[name="cvc"]').fill("123");
  const zip = card.locator('input[name="postalCode"]');
  if (await zip.count()) await zip.fill("98109");
  await page.getByRole("button", { name: /Place order/ }).click();
  await page.waitForURL(/thankyou/, { timeout: 90_000 });
}

// The order id shown on the thank-you page ("Order # 123-...").
export async function orderIdFromThankYou(page: Page) {
  const text = await page.getByText(/\d{3}-\d{7}-\d{7}/).first().textContent();
  return text!.match(/\d{3}-\d{7}-\d{7}/)![0];
}
