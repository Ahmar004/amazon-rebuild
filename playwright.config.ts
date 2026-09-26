import { defineConfig, devices } from "@playwright/test";

// End-to-end tests at desktop and phone widths. Each test registers its own e2e- shopper and
// global-teardown.ts removes them afterwards. Checkout flows pay with Stripe test cards, so a
// test gets a few minutes.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 3,
  reporter: [["list"]],
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", trace: "retain-on-failure" },
  // The installed Chrome, so no Playwright browser download is needed.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: process.env.E2E_BASE_URL ? undefined : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
