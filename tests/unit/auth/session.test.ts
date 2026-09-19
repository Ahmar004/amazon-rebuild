import { describe, expect, it } from "vitest";
import { generateSessionId } from "@/lib/auth/session";

describe("generateSessionId", () => {
  it("returns 64 hex characters (32 random bytes)", () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns a different id every call", () => {
    expect(generateSessionId()).not.toBe(generateSessionId());
  });
});
