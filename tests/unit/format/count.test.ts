import { describe, expect, it } from "vitest";
import { countLabel } from "@/lib/format/count";

describe("countLabel", () => {
  it("uses the singular for one", () => {
    expect(countLabel(1, "item")).toBe("1 item");
  });

  it("adds an s for zero and for more than one", () => {
    expect(countLabel(0, "item")).toBe("0 items");
    expect(countLabel(3, "unit")).toBe("3 units");
  });

  it("takes an irregular plural", () => {
    expect(countLabel(1, "person", "people")).toBe("1 person");
    expect(countLabel(2, "person", "people")).toBe("2 people");
  });

  it("groups thousands", () => {
    expect(countLabel(1200, "listing")).toBe("1,200 listings");
  });
});
