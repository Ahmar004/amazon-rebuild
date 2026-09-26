import { randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { orderIdFromThankYou, payAtCheckout, signedInPage, trackErrors } from "./support";

// Point 15, D2-D4: one user lists an item, another buys it, the seller ships and delivers it and
// the buyer's timeline follows, the buyer reviews it, and the seller's dashboard keeps the sale
// even after the listing is deleted.
test("sell, buy, ship, deliver, review and delete a listing", async ({ browser }, testInfo) => {
  const tag = randomBytes(4).toString("hex");
  const title = `Hand-thrown ceramic mug sage ${tag}`;
  const seller = await signedInPage(browser, "Sam");
  const buyer = await signedInPage(browser, "Bea");
  const sellerErrors = trackErrors(seller.page);
  const buyerErrors = trackErrors(buyer.page);
  const s = seller.page;
  const b = buyer.page;

  // Selling mode swaps the quick links and lands on the empty dashboard.
  await s.getByRole("button", { name: "Selling" }).click();
  await expect(s).toHaveURL(/\/seller$/);
  await expect(s.getByRole("button", { name: "Selling" })).toHaveAttribute("aria-pressed", "true");
  await expect(s.getByText("Start selling on Shopeedo")).toBeVisible();

  // A listing photo, drawn in the browser.
  const photo = testInfo.outputPath("mug.png");
  const art = await s.context().newPage();
  await art.setContent(`<div id="p" style="width:600px;height:600px;background:linear-gradient(135deg,#f6e7c8,#6f9c86)"></div>`);
  await art.locator("#p").screenshot({ path: photo });
  await art.close();

  await s.getByRole("link", { name: "Sell an item" }).first().click();
  await expect(s).toHaveURL(/\/seller\/listings\/new/);
  await s.getByRole("button", { name: "Publish listing" }).click();
  await expect(s.locator(".text-danger").first()).toBeVisible();
  await s.locator("input[type=file]").setInputFiles(photo);
  await expect(s.locator('[aria-label="Listing photos"] img[alt^="Photo"]')).toHaveCount(1, { timeout: 60_000 });
  await s.getByRole("textbox", { name: "Title" }).fill(title);
  await s.locator("#categorySlug").selectOption({ index: 1 });
  await s.locator("#description").fill("A 12 oz stoneware mug thrown on the wheel and glazed by hand. Dishwasher safe.");
  await s.getByRole("textbox", { name: "Price ($)" }).fill("24.50");
  await s.getByRole("textbox", { name: "Stock" }).fill("5");
  await s.getByRole("button", { name: "Publish listing" }).click();
  await s.waitForURL(/\/seller\/listings$/, { timeout: 30_000 });
  const href = (await s.locator("main a[href^='/product/']").first().getAttribute("href"))!;

  // The seller sees their own panel instead of Buy.
  await s.goto(href);
  await expect(s.locator("button[data-intent=add-to-cart]")).toHaveCount(0);

  // The buyer finds it in search and buys it.
  await b.goto(`/search?k=${tag}`);
  await expect(b.locator(`main a[href='${href}']`).first()).toBeVisible();
  await b.goto(href);
  await expect(b.getByText("Sam T.").first()).toBeVisible();
  await b.getByRole("button", { name: "Buy now" }).click();
  await payAtCheckout(b);
  const orderId = await orderIdFromThankYou(b);

  const buyerOrder = async () => {
    await b.goto(`/orders/${orderId}`);
    return b;
  };
  await buyerOrder();
  await expect(b.getByText("Waiting for the seller").first()).toBeVisible();
  await expect(b.getByRole("button", { name: "Cancel order" })).toBeVisible();

  // Seller ships: the buyer can no longer cancel.
  await s.goto("/seller/orders");
  const card = s.locator("li", { hasText: `Order # ${orderId}` }).first();
  await card.getByRole("button", { name: "Mark as shipped" }).click();
  await expect(s.getByText(/Marked as shipped/).first()).toBeVisible();
  await buyerOrder();
  await expect(b.getByRole("button", { name: "Cancel order" })).toHaveCount(0);

  await s.goto("/seller/orders?tab=shipped");
  await s.locator("li", { hasText: `Order # ${orderId}` }).first().getByRole("button", { name: "Mark as delivered" }).click();
  await expect(s.getByText(/Marked as delivered/).first()).toBeVisible();
  await buyerOrder();
  await expect(b.getByText("Waiting for the seller")).toHaveCount(0);
  await expect(b.getByText(/Delivered/).first()).toBeVisible();

  // Only a buyer can review (C19), and the review is marked as a verified purchase.
  await b.goto(`${href}#reviews`);
  await b.getByRole("button", { name: "Write a review" }).click();
  await b.getByRole("radio", { name: "5 stars" }).check({ force: true });
  await b.getByLabel("Headline").fill("Lovely glaze");
  await b.locator("#review-body").fill("Holds a full coffee and the glaze is even better in person.");
  await b.getByRole("button", { name: "Post review" }).click();
  await expect(b.getByText("Lovely glaze")).toBeVisible();
  await expect(b.getByText("Verified purchase").first()).toBeVisible();

  // Dashboard counts the sale.
  await s.goto("/seller");
  await expect(s.getByRole("heading", { name: "Daily sales" })).toBeVisible();
  await expect(s.getByText(title).first()).toBeVisible();

  // Pause hides it from buyers, Resume brings it back.
  await s.goto("/seller/listings");
  await s.getByRole("button", { name: "Pause" }).first().click();
  await expect(s.getByRole("button", { name: "Resume" }).first()).toBeVisible();
  await b.goto(href);
  await expect(b.getByText("Currently unavailable.")).toBeVisible();
  await s.getByRole("button", { name: "Resume" }).first().click();
  await expect(s.getByRole("button", { name: "Pause" }).first()).toBeVisible();

  // Delete: the ordered listing is hidden, but the dashboard keeps the sale (S6 finding).
  await s.getByRole("button", { name: "Delete" }).first().click();
  await s.getByRole("button", { name: "Yes, delete" }).click();
  await expect(s.getByText("Listing deleted").first()).toBeVisible();
  await s.goto("/seller");
  await expect(s.getByText("Start selling on Shopeedo")).toHaveCount(0);
  await expect(s.getByRole("heading", { name: "Daily sales" })).toBeVisible();
  await expect(s.getByText(title).first()).toBeVisible();
  await buyerOrder();
  await expect(b.getByText(title).first()).toBeVisible();

  expect(sellerErrors).toEqual([]);
  expect(buyerErrors).toEqual([]);
  await seller.close();
  await buyer.close();
});
