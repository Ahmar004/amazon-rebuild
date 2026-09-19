// "Estimated tax to be collected" (docs/spec.md 6.3): the items subtotal multiplied by the
// shipping state's base sales tax rate, from a fixed per-state table. These are each state's
// statewide base rate (not local add-ons), which is the approximation the spec calls for.
// AK, DE, MT, NH and OR levy no statewide sales tax.
import type { UsState } from "@/lib/constants/us-states";

export const STATE_TAX_RATES: Record<UsState, number> = {
  AL: 0.04,
  AK: 0,
  AZ: 0.056,
  AR: 0.065,
  CA: 0.0725,
  CO: 0.029,
  CT: 0.0635,
  DE: 0,
  DC: 0.06,
  FL: 0.06,
  GA: 0.04,
  HI: 0.04,
  ID: 0.06,
  IL: 0.0625,
  IN: 0.07,
  IA: 0.06,
  KS: 0.065,
  KY: 0.06,
  LA: 0.0445,
  ME: 0.055,
  MD: 0.06,
  MA: 0.0625,
  MI: 0.06,
  MN: 0.06875,
  MS: 0.07,
  MO: 0.04225,
  MT: 0,
  NE: 0.055,
  NV: 0.0685,
  NH: 0,
  NJ: 0.06625,
  NM: 0.04875,
  NY: 0.04,
  NC: 0.0475,
  ND: 0.05,
  OH: 0.0575,
  OK: 0.045,
  OR: 0,
  PA: 0.06,
  RI: 0.07,
  SC: 0.06,
  SD: 0.042,
  TN: 0.07,
  TX: 0.0625,
  UT: 0.0485,
  VT: 0.06,
  VA: 0.043,
  WA: 0.065,
  WV: 0.06,
  WI: 0.05,
  WY: 0.04,
};

// Math.round matches docs/design.md 5.1's contract: "taxCents = Math.round(itemsCents * rate)".
export function taxCents(itemsCents: number, state: UsState): number {
  return Math.round(itemsCents * STATE_TAX_RATES[state]);
}
