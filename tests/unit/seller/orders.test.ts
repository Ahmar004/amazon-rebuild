import { describe, expect, it } from "vitest";
import { groupSellerOrders, parseSellerOrderTab, sellerItemTab } from "@/lib/seller/orders";

const d = (iso: string) => new Date(iso);
const base = { cancelledAt: null, shippedAt: null, deliveredAt: null };

describe("sellerItemTab", () => {
  it("files each sold item under the step it's waiting on", () => {
    expect(sellerItemTab(base)).toBe("to-ship");
    expect(sellerItemTab({ ...base, shippedAt: d("2026-09-21T09:00:00Z") })).toBe("shipped");
    expect(sellerItemTab({ ...base, shippedAt: d("2026-09-21T09:00:00Z"), deliveredAt: d("2026-09-22T09:00:00Z") })).toBe("delivered");
    expect(sellerItemTab({ ...base, cancelledAt: d("2026-09-20T09:00:00Z") })).toBe("cancelled");
  });
});

describe("parseSellerOrderTab", () => {
  it("falls back to To ship", () => {
    expect(parseSellerOrderTab("delivered")).toBe("delivered");
    expect(parseSellerOrderTab("nope")).toBe("to-ship");
    expect(parseSellerOrderTab(undefined)).toBe("to-ship");
  });
});

describe("groupSellerOrders", () => {
  it("groups items by order, keeping the order they arrive in", () => {
    const row = (orderId: string, asin: string) => ({ orderId, asin });
    const groups = groupSellerOrders([row("A", "L1"), row("B", "L2"), row("A", "L3")]);
    expect(groups.map((g) => [g.orderId, g.items.map((i) => i.asin)])).toEqual([
      ["A", ["L1", "L3"]],
      ["B", ["L2"]],
    ]);
  });
});
