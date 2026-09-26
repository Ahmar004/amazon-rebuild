import { describe, expect, it } from "vitest";
import { dailySeries, niceTicks } from "@/lib/seller/chart";

describe("niceTicks", () => {
  it("rounds the top of the axis up to a clean number", () => {
    expect(niceTicks(0)).toEqual([0, 1, 2]);
    expect(niceTicks(1)).toEqual([0, 0.5, 1]);
    expect(niceTicks(7)).toEqual([0, 5, 10]);
    expect(niceTicks(2450)).toEqual([0, 2500, 5000]);
    expect(niceTicks(10000)).toEqual([0, 5000, 10000]);
  });
});

describe("dailySeries", () => {
  it("returns one entry per day, oldest first, with zeros for quiet days", () => {
    const now = new Date("2026-09-26T15:00:00Z");
    const series = dailySeries([{ day: "2026-09-25", cents: 2450, units: 1 }, { day: "2026-09-26", cents: 900, units: 2 }], 3, now);
    expect(series).toEqual([
      { day: "2026-09-24", cents: 0, units: 0 },
      { day: "2026-09-25", cents: 2450, units: 1 },
      { day: "2026-09-26", cents: 900, units: 2 },
    ]);
  });
});
