import { describe, expect, it } from "vitest";
import { clickZone, wrapIndex } from "@/lib/home/hero";

describe("clickZone", () => {
  it("returns prev for clicks in the left 25% of the slide", () => {
    expect(clickZone(0, 1000)).toBe("prev");
    expect(clickZone(249, 1000)).toBe("prev");
  });

  it("returns next for clicks in the right 25% of the slide", () => {
    expect(clickZone(751, 1000)).toBe("next");
    expect(clickZone(1000, 1000)).toBe("next");
  });

  it("returns none for the middle half, where the slide's own link lives", () => {
    expect(clickZone(250, 1000)).toBe("none");
    expect(clickZone(500, 1000)).toBe("none");
    expect(clickZone(750, 1000)).toBe("none");
  });

  it("returns none for a zero-width slide", () => {
    expect(clickZone(0, 0)).toBe("none");
  });
});

describe("wrapIndex", () => {
  it("wraps past either end", () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(2, 5)).toBe(2);
  });

  it("returns 0 when there are no slides", () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});
