import { describe, expect, it } from "vitest";
import { STATE_TAX_RATES, taxCents } from "@/lib/pricing/tax";
import { US_STATE_CODES } from "@/lib/constants/us-states";

describe("STATE_TAX_RATES", () => {
  it("has a rate for every US state and DC", () => {
    for (const code of US_STATE_CODES) {
      expect(STATE_TAX_RATES[code]).toBeDefined();
      expect(STATE_TAX_RATES[code]).toBeGreaterThanOrEqual(0);
    }
  });

  it("has no base sales tax in AK, DE, MT, NH, OR", () => {
    expect(STATE_TAX_RATES.AK).toBe(0);
    expect(STATE_TAX_RATES.DE).toBe(0);
    expect(STATE_TAX_RATES.MT).toBe(0);
    expect(STATE_TAX_RATES.NH).toBe(0);
    expect(STATE_TAX_RATES.OR).toBe(0);
  });
});

describe("taxCents", () => {
  it("is zero in a no-tax state", () => {
    expect(taxCents(10000, "OR")).toBe(0);
  });

  it("multiplies the items subtotal by the state's rate and rounds", () => {
    // CA rate is 0.0725: 10000 * 0.0725 = 725 exactly.
    expect(taxCents(10000, "CA")).toBe(725);
  });

  it("rounds to the nearest cent", () => {
    // 1099 * 0.0725 = 79.6775 -> rounds to 80.
    expect(taxCents(1099, "CA")).toBe(80);
  });
});
