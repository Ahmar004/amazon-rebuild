import { describe, expect, it } from "vitest";
import { addressSchema } from "@/lib/validation/address";

const VALID = {
  fullName: "Jane Doe",
  phone: "2065551234",
  line1: "123 Main St",
  line2: "",
  city: "Seattle",
  state: "WA",
  zip: "98101",
  isDefault: false,
  instructions: "",
};

describe("addressSchema", () => {
  it("accepts a well-formed address", () => {
    expect(addressSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepts an optional line2 and instructions", () => {
    const result = addressSchema.safeParse({ ...VALID, line2: "Apt 4", instructions: "Leave at door" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing full name", () => {
    expect(addressSchema.safeParse({ ...VALID, fullName: "" }).success).toBe(false);
  });

  it("rejects a phone with fewer than 10 digits", () => {
    expect(addressSchema.safeParse({ ...VALID, phone: "12345" }).success).toBe(false);
  });

  it("accepts a phone with punctuation as long as it has 10+ digits", () => {
    expect(addressSchema.safeParse({ ...VALID, phone: "(206) 555-1234" }).success).toBe(true);
  });

  it("rejects a missing street address", () => {
    expect(addressSchema.safeParse({ ...VALID, line1: "" }).success).toBe(false);
  });

  it("rejects a missing city", () => {
    expect(addressSchema.safeParse({ ...VALID, city: "" }).success).toBe(false);
  });

  it("rejects an invalid state code", () => {
    expect(addressSchema.safeParse({ ...VALID, state: "ZZ" }).success).toBe(false);
  });

  it("rejects a ZIP that isn't exactly 5 digits", () => {
    expect(addressSchema.safeParse({ ...VALID, zip: "9810" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...VALID, zip: "981011" }).success).toBe(false);
    expect(addressSchema.safeParse({ ...VALID, zip: "9810a" }).success).toBe(false);
  });
});
