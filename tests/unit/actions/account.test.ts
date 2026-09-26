import { beforeEach, describe, expect, it, vi } from "vitest";

const user = { id: "11111111-1111-4111-8111-111111111111" };
const other = { id: "22222222-2222-4222-8222-222222222222" };
const currentUser = vi.fn(async (): Promise<typeof user | null> => user);
const users = {
  findUserByEmail: vi.fn(async (): Promise<{ id: string } | null> => null),
  updateProfile: vi.fn(),
  getPasswordHash: vi.fn(async () => "hash"),
  setPasswordHash: vi.fn(),
};
const password = { verifyPassword: vi.fn(async () => true), hashPassword: vi.fn(async () => "new-hash") };
const addresses = { deleteAddress: vi.fn(), setDefaultAddress: vi.fn() };
const payments = { removePaymentMethod: vi.fn(), setDefaultPaymentMethod: vi.fn(), getPaymentMethod: vi.fn(async () => null) };

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: currentUser }));
vi.mock("@/lib/data/users", () => users);
vi.mock("@/lib/auth/password", () => password);
vi.mock("@/lib/data/addresses", () => addresses);
vi.mock("@/lib/data/payments", () => payments);
vi.mock("@/lib/stripe", () => ({ stripe: { paymentMethods: { detach: vi.fn() } } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const account = await import("@/actions/account");
const ADDRESS_ID = "33333333-3333-4333-8333-333333333333";

describe("updateProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("saves a trimmed name and lowercased email for the signed-in user", async () => {
    const result = await account.updateProfile({ name: " Robin ", email: "Robin@Example.com" });
    expect(result).toEqual({ ok: true });
    expect(users.updateProfile).toHaveBeenCalledWith(user.id, { name: "Robin", email: "robin@example.com" });
  });

  it("refuses an email another account uses", async () => {
    users.findUserByEmail.mockResolvedValueOnce(other);
    const result = await account.updateProfile({ name: "Robin", email: "taken@example.com" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { email: expect.any(String) } });
    expect(users.updateProfile).not.toHaveBeenCalled();
  });

  it("allows keeping your own email", async () => {
    users.findUserByEmail.mockResolvedValueOnce(user);
    expect((await account.updateProfile({ name: "Robin", email: "me@example.com" })).ok).toBe(true);
  });

  it("reports field errors", async () => {
    const result = await account.updateProfile({ name: "", email: "nope" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { name: expect.any(String), email: expect.any(String) } });
  });

  it("refuses when signed out", async () => {
    currentUser.mockResolvedValueOnce(null);
    expect((await account.updateProfile({ name: "Robin", email: "a@b.co" })).ok).toBe(false);
  });
});

describe("changePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("needs the current password", async () => {
    password.verifyPassword.mockResolvedValueOnce(false);
    const result = await account.changePassword({ currentPassword: "wrong", newPassword: "secret123" });
    expect(result).toMatchObject({ ok: false, fieldErrors: { currentPassword: expect.any(String) } });
    expect(users.setPasswordHash).not.toHaveBeenCalled();
  });

  it("stores the new hash", async () => {
    expect(await account.changePassword({ currentPassword: "old-pass", newPassword: "secret123" })).toEqual({ ok: true });
    expect(users.setPasswordHash).toHaveBeenCalledWith(user.id, "new-hash");
  });

  it("rejects a short or unchanged password", async () => {
    expect((await account.changePassword({ currentPassword: "old-pass", newPassword: "abc" })).ok).toBe(false);
    expect((await account.changePassword({ currentPassword: "same-pass", newPassword: "same-pass" })).ok).toBe(false);
  });
});

describe("address and card actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("scopes every write to the signed-in user", async () => {
    await account.removeAddress(ADDRESS_ID);
    await account.makeDefaultAddress(ADDRESS_ID);
    await account.removeCard(ADDRESS_ID);
    await account.makeDefaultCard(ADDRESS_ID);
    expect(addresses.deleteAddress).toHaveBeenCalledWith(user.id, ADDRESS_ID);
    expect(addresses.setDefaultAddress).toHaveBeenCalledWith(user.id, ADDRESS_ID);
    expect(payments.removePaymentMethod).toHaveBeenCalledWith(user.id, ADDRESS_ID);
    expect(payments.setDefaultPaymentMethod).toHaveBeenCalledWith(user.id, ADDRESS_ID);
  });

  it("rejects a malformed id", async () => {
    expect((await account.removeAddress("not-an-id")).ok).toBe(false);
    expect(addresses.deleteAddress).not.toHaveBeenCalled();
  });
});
