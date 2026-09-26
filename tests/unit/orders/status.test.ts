import { describe, expect, it } from "vitest";
import { ORDER_STATUS } from "@/lib/constants/orders";
import { canCancel, orderStatus, orderTimeline } from "@/lib/orders/status";

const placedAt = new Date("2026-09-20T10:00:00Z");
const deliveryDate = new Date("2026-09-24T00:00:00Z");
const order = { placedAt, deliveryDate, cancelledAt: null };
const at = (iso: string) => new Date(iso);

describe("orderStatus", () => {
  it("is Ordered for the first hour", () => {
    expect(orderStatus(order, at("2026-09-20T10:59:59Z"))).toBe(ORDER_STATUS.ordered);
  });

  it("is Shipped from one hour until the delivery date", () => {
    expect(orderStatus(order, at("2026-09-20T11:00:00Z"))).toBe(ORDER_STATUS.shipped);
    expect(orderStatus(order, at("2026-09-23T23:59:59Z"))).toBe(ORDER_STATUS.shipped);
  });

  it("is Out for delivery on the delivery date before 6 pm UTC", () => {
    expect(orderStatus(order, at("2026-09-24T00:00:00Z"))).toBe(ORDER_STATUS.outForDelivery);
    expect(orderStatus(order, at("2026-09-24T17:59:59Z"))).toBe(ORDER_STATUS.outForDelivery);
  });

  it("is Delivered from 6 pm UTC on the delivery date", () => {
    expect(orderStatus(order, at("2026-09-24T18:00:00Z"))).toBe(ORDER_STATUS.delivered);
    expect(orderStatus(order, at("2026-10-30T00:00:00Z"))).toBe(ORDER_STATUS.delivered);
  });

  it("is Cancelled once cancelled, whatever the time", () => {
    expect(orderStatus({ ...order, cancelledAt: at("2026-09-20T10:30:00Z") }, at("2026-09-25T00:00:00Z"))).toBe(ORDER_STATUS.cancelled);
  });
});

describe("canCancel", () => {
  it("allows cancelling only before the order ships", () => {
    expect(canCancel(order, at("2026-09-20T10:30:00Z"))).toBe(true);
    expect(canCancel(order, at("2026-09-20T11:00:00Z"))).toBe(false);
    expect(canCancel({ ...order, cancelledAt: at("2026-09-20T10:10:00Z") }, at("2026-09-20T10:30:00Z"))).toBe(false);
  });
});

describe("orderTimeline", () => {
  it("marks the steps reached so far and the current one", () => {
    const steps = orderTimeline(order, at("2026-09-22T00:00:00Z"));
    expect(steps.map((s) => [s.status, s.reached, s.current])).toEqual([
      [ORDER_STATUS.ordered, true, false],
      [ORDER_STATUS.shipped, true, true],
      [ORDER_STATUS.outForDelivery, false, false],
      [ORDER_STATUS.delivered, false, false],
    ]);
    expect(steps[1].at).toEqual(at("2026-09-20T11:00:00Z"));
    expect(steps[3].at).toEqual(at("2026-09-24T18:00:00Z"));
  });

  it("stops at Ordered then Cancelled for a cancelled order", () => {
    const steps = orderTimeline({ ...order, cancelledAt: at("2026-09-20T10:20:00Z") }, at("2026-09-22T00:00:00Z"));
    expect(steps.map((s) => [s.status, s.reached, s.current])).toEqual([
      [ORDER_STATUS.ordered, true, false],
      [ORDER_STATUS.cancelled, true, true],
    ]);
  });
});

describe("orders with items sold by users (D3)", () => {
  const catalogue = { sellerId: null, shippedAt: null, deliveredAt: null };
  const waiting = { sellerId: "seller-1", shippedAt: null, deliveredAt: null };
  const shipped = { sellerId: "seller-1", shippedAt: at("2026-09-21T09:00:00Z"), deliveredAt: null };
  const delivered = { sellerId: "seller-1", shippedAt: at("2026-09-21T09:00:00Z"), deliveredAt: at("2026-09-22T15:00:00Z") };
  const late = at("2026-10-30T00:00:00Z");

  it("moves a seller's item only when the seller marks it", async () => {
    const { itemStatus } = await import("@/lib/orders/status");
    expect(itemStatus(order, waiting, late)).toBe(ORDER_STATUS.ordered);
    expect(itemStatus(order, shipped, late)).toBe(ORDER_STATUS.shipped);
    expect(itemStatus(order, delivered, late)).toBe(ORDER_STATUS.delivered);
    expect(itemStatus(order, catalogue, late)).toBe(ORDER_STATUS.delivered);
    expect(itemStatus({ ...order, cancelledAt: placedAt }, delivered, late)).toBe(ORDER_STATUS.cancelled);
  });

  it("gives the order the status of its least advanced item", () => {
    expect(orderStatus({ ...order, items: [catalogue, shipped] }, late)).toBe(ORDER_STATUS.shipped);
    expect(orderStatus({ ...order, items: [delivered, waiting] }, late)).toBe(ORDER_STATUS.ordered);
    expect(orderStatus({ ...order, items: [delivered, catalogue] }, late)).toBe(ORDER_STATUS.delivered);
  });

  it("allows cancelling only while no item has shipped", () => {
    const early = at("2026-09-20T10:30:00Z");
    expect(canCancel({ ...order, items: [catalogue, waiting] }, early)).toBe(true);
    expect(canCancel({ ...order, items: [waiting] }, late)).toBe(true);
    expect(canCancel({ ...order, items: [catalogue, shipped] }, early)).toBe(false);
    expect(canCancel({ ...order, items: [catalogue, waiting] }, at("2026-09-20T11:00:00Z"))).toBe(false);
  });

  it("builds Ordered > Shipped > Delivered from the seller's dates", () => {
    const steps = orderTimeline({ ...order, items: [shipped] }, late);
    expect(steps.map((s) => [s.status, s.reached, s.current, s.at])).toEqual([
      [ORDER_STATUS.ordered, true, false, placedAt],
      [ORDER_STATUS.shipped, true, true, shipped.shippedAt],
      [ORDER_STATUS.delivered, false, false, null],
    ]);
  });

  it("reaches a step only when every item has, dated by the last one", () => {
    const steps = orderTimeline({ ...order, items: [catalogue, delivered] }, late);
    expect(steps.map((s) => [s.status, s.reached])).toEqual([
      [ORDER_STATUS.ordered, true],
      [ORDER_STATUS.shipped, true],
      [ORDER_STATUS.delivered, true],
    ]);
    expect(steps[2].at).toEqual(at("2026-09-24T18:00:00Z"));
  });
});
