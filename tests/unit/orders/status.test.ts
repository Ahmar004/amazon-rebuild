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
