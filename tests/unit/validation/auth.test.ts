import { describe, expect, it } from "vitest";
import { AUTH_ERRORS, parseIdentifier, registerSchema, signInPasswordSchema } from "@/lib/validation/auth";

describe("parseIdentifier", () => {
  it("returns the lowercased, trimmed email for a valid email", () => {
    expect(parseIdentifier("  Someone@Example.com  ")).toEqual({ ok: true, email: "someone@example.com" });
  });

  it("rejects an empty value", () => {
    expect(parseIdentifier("")).toEqual({ ok: false, error: AUTH_ERRORS.identifierEmpty });
  });

  it("rejects a value that is only whitespace", () => {
    expect(parseIdentifier("   ")).toEqual({ ok: false, error: AUTH_ERRORS.identifierEmpty });
  });

  it("rejects a phone-shaped value", () => {
    expect(parseIdentifier("+1 (555) 123-4567")).toEqual({ ok: false, error: AUTH_ERRORS.identifierPhone });
  });

  it("rejects a shorter phone-shaped value", () => {
    expect(parseIdentifier("5551234567")).toEqual({ ok: false, error: AUTH_ERRORS.identifierPhone });
  });

  it("rejects a value that is neither an email nor phone-shaped", () => {
    expect(parseIdentifier("not-an-email")).toEqual({ ok: false, error: AUTH_ERRORS.identifierInvalid });
  });
});

describe("signInPasswordSchema", () => {
  it("accepts an email and a non-empty password", () => {
    const result = signInPasswordSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = signInPasswordSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = { email: "a@b.com", name: "Jane Doe", password: "abcdef", confirmPassword: "abcdef" };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("requires a name", () => {
    const result = registerSchema.safeParse({ ...base, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === AUTH_ERRORS.nameRequired)).toBe(true);
    }
  });

  it("requires at least 6 characters for the password", () => {
    const result = registerSchema.safeParse({ ...base, password: "abcde", confirmPassword: "abcde" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === AUTH_ERRORS.passwordTooShort)).toBe(true);
    }
  });

  it("requires the passwords to match", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "different" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === AUTH_ERRORS.passwordMismatch)).toBe(true);
    }
  });
});
