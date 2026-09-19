import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

process.env.SESSION_SECRET = "test-session-secret";

const { CART_TOKEN_COOKIE, signGuestToken, verifyGuestToken, getGuestToken, ensureGuestToken } =
  await import("@/lib/auth/guest");

const KEY = "unit-test-key";

describe("signGuestToken / verifyGuestToken", () => {
  it("round-trips a valid token", () => {
    const token = signGuestToken("guest-abc", KEY);
    expect(verifyGuestToken(token, KEY)).toBe("guest-abc");
  });

  it("rejects a token whose id was swapped for another id", () => {
    const token = signGuestToken("guest-abc", KEY);
    const signature = token.slice(token.lastIndexOf(".") + 1);
    expect(verifyGuestToken(`someone-elses-id.${signature}`, KEY)).toBeNull();
  });

  it("rejects a token with a tampered signature", () => {
    expect(verifyGuestToken(`guest-abc.${"0".repeat(64)}`, KEY)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = signGuestToken("guest-abc", "a-different-key");
    expect(verifyGuestToken(token, KEY)).toBeNull();
  });

  it("returns null for a missing, empty, or separator-less token", () => {
    expect(verifyGuestToken(undefined, KEY)).toBeNull();
    expect(verifyGuestToken("", KEY)).toBeNull();
    expect(verifyGuestToken("no-separator-here", KEY)).toBeNull();
  });
});

describe("getGuestToken", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockClear();
  });

  it("returns null when the cookie is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getGuestToken()).toBeNull();
  });

  it("returns the guest id for a validly signed cookie", async () => {
    const token = signGuestToken("guest-1");
    cookieStore.get.mockReturnValue({ value: token });
    expect(await getGuestToken()).toBe("guest-1");
    expect(cookieStore.get).toHaveBeenCalledWith(CART_TOKEN_COOKIE);
  });

  it("returns null for a tampered cookie", async () => {
    cookieStore.get.mockReturnValue({ value: "guest-1.deadbeef" });
    expect(await getGuestToken()).toBeNull();
  });
});

describe("ensureGuestToken", () => {
  beforeEach(() => {
    cookieStore.get.mockReset();
    cookieStore.set.mockClear();
  });

  it("returns the existing id and sets no cookie when one already verifies", async () => {
    const token = signGuestToken("guest-2");
    cookieStore.get.mockReturnValue({ value: token });

    const id = await ensureGuestToken();

    expect(id).toBe("guest-2");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("creates and persists a new signed token when missing", async () => {
    cookieStore.get.mockReturnValue(undefined);

    const id = await ensureGuestToken();

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(cookieStore.set).toHaveBeenCalledWith(
      CART_TOKEN_COOKIE,
      expect.stringContaining(`${id}.`),
      expect.objectContaining({ path: "/", sameSite: "lax", httpOnly: true }),
    );
  });

  it("creates a new token when the existing cookie is tampered with", async () => {
    cookieStore.get.mockReturnValue({ value: "guest-3.deadbeef" });

    const id = await ensureGuestToken();

    expect(id).not.toBe("guest-3");
    expect(cookieStore.set).toHaveBeenCalled();
  });
});
