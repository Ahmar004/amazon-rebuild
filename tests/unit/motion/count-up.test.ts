import { describe, expect, it } from "vitest";
import { countUpValue } from "@/lib/motion/count-up";

describe("countUpValue", () => {
  it("starts at zero and lands exactly on the target", () => {
    expect(countUpValue(1250, 0, 1000)).toBe(0);
    expect(countUpValue(1250, 1000, 1000)).toBe(1250);
    expect(countUpValue(1250, 5000, 1000)).toBe(1250);
  });

  it("eases out, so it is past halfway at the halfway mark", () => {
    const half = countUpValue(1000, 500, 1000);
    expect(half).toBeGreaterThan(500);
    expect(half).toBeLessThan(1000);
  });

  it("only returns whole numbers (cents or counts) and never overshoots", () => {
    for (let t = 0; t <= 1000; t += 37) {
      const value = countUpValue(999, t, 1000);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeLessThanOrEqual(999);
    }
  });

  it("returns the target at once for a zero duration or a zero target", () => {
    expect(countUpValue(42, 0, 0)).toBe(42);
    expect(countUpValue(0, 100, 1000)).toBe(0);
  });
});
