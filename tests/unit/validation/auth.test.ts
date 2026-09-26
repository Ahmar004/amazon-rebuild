import { describe, expect, it } from "vitest";
import { AUTH_ERRORS, fieldErrorsOf, registerSchema, signInSchema } from "@/lib/validation/auth";

describe("signInSchema", () => {
  it("accepts an email and a non-empty password, lowercasing and trimming the email", () => {
    const result = signInSchema.safeParse({ email: "  Someone@Example.com ", password: "x" });
    expect(result.success && result.data.email).toBe("someone@example.com");
  });

  it("rejects an invalid email with the email message", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error).email).toBe(AUTH_ERRORS.emailInvalid);
  });

  it("rejects an empty password with the password message", () => {
    const result = signInSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error).password).toBe(AUTH_ERRORS.passwordRequired);
  });
});

describe("registerSchema", () => {
  const base = { email: "a@b.com", name: "Jane Doe", password: "abcdef" };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("requires a name", () => {
    const result = registerSchema.safeParse({ ...base, name: "  " });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error).name).toBe(AUTH_ERRORS.nameRequired);
  });

  it("requires a valid email", () => {
    const result = registerSchema.safeParse({ ...base, email: "nope" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error).email).toBe(AUTH_ERRORS.emailInvalid);
  });

  it("requires at least 6 characters for the password", () => {
    const result = registerSchema.safeParse({ ...base, password: "abcde" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorsOf(result.error).password).toBe(AUTH_ERRORS.passwordTooShort);
  });
});

describe("fieldErrorsOf", () => {
  it("keeps only the first message per field", () => {
    const result = registerSchema.safeParse({ email: "nope", name: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(fieldErrorsOf(result.error)).sort()).toEqual(["email", "name", "password"]);
    }
  });
});
