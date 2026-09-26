import { beforeEach, describe, expect, it, vi } from "vitest";
import { SUPPORT_ERRORS } from "@/lib/constants/support";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const REQUEST_ID = "22222222-2222-4222-8222-222222222222";
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const data = {
  userOwnsOrder: vi.fn(async () => true),
  createSupportRequest: vi.fn(async () => ({ id: REQUEST_ID })),
  closeSupportRequest: vi.fn(),
};

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/data/support", () => data);
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { submitSupportRequest, closeRequest } = await import("@/actions/support");

const valid = { topic: "order", orderId: "111-2222222-3333333", subject: "Wrong colour", message: "The mug arrived in blue, I ordered red." };

describe("submitSupportRequest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves a valid request for the signed-in user", async () => {
    expect(await submitSupportRequest(valid)).toEqual({ ok: true });
    expect(data.createSupportRequest).toHaveBeenCalledWith(user.id, {
      topic: "order",
      orderId: valid.orderId,
      subject: "Wrong colour",
      message: valid.message,
    });
  });

  it("stores no order when none is picked", async () => {
    await submitSupportRequest({ ...valid, orderId: "" });
    expect(data.userOwnsOrder).not.toHaveBeenCalled();
    expect(data.createSupportRequest).toHaveBeenCalledWith(user.id, expect.objectContaining({ orderId: null }));
  });

  it("refuses an order that isn't the user's", async () => {
    data.userOwnsOrder.mockResolvedValueOnce(false);
    expect(await submitSupportRequest(valid)).toEqual({ ok: false, fieldErrors: { orderId: SUPPORT_ERRORS.orderNotFound } });
    expect(data.createSupportRequest).not.toHaveBeenCalled();
  });

  it("reports field errors", async () => {
    const result = await submitSupportRequest({ topic: "nope", subject: "", message: "short" });
    expect(result).toMatchObject({
      ok: false,
      fieldErrors: { topic: SUPPORT_ERRORS.topicRequired, subject: SUPPORT_ERRORS.subjectRequired, message: SUPPORT_ERRORS.messageTooShort },
    });
  });

  it("refuses when signed out", async () => {
    currentUser.mockResolvedValueOnce(null);
    expect((await submitSupportRequest(valid)).ok).toBe(false);
    expect(data.createSupportRequest).not.toHaveBeenCalled();
  });
});

describe("closeRequest", () => {
  beforeEach(() => vi.clearAllMocks());

  it("closes the user's own request", async () => {
    expect(await closeRequest(REQUEST_ID)).toEqual({ ok: true });
    expect(data.closeSupportRequest).toHaveBeenCalledWith(user.id, REQUEST_ID);
  });

  it("rejects a malformed id", async () => {
    expect((await closeRequest("x")).ok).toBe(false);
    expect(data.closeSupportRequest).not.toHaveBeenCalled();
  });
});
