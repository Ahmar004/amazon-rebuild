// Guest cart identity: an HMAC-SHA256-signed id stored in the cart_token cookie, so a visitor's
// cart survives without an account (docs/design.md 5.2). Signing/verifying is pure (testable
// without next/headers); getGuestToken/ensureGuestToken are the only parts that touch cookies().
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const CART_TOKEN_COOKIE = "cart_token";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function requiredSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function hmac(id: string, key: string): string {
  return createHmac("sha256", key).update(id).digest("hex");
}

// Pure: builds the "<id>.<hmac>" token stored in the cart_token cookie value.
export function signGuestToken(id: string, key: string = requiredSecret()): string {
  return `${id}.${hmac(id, key)}`;
}

// Pure: returns the guest id for a valid token, or null when the token is missing, malformed, or
// its signature doesn't match (tampered with).
export function verifyGuestToken(token: string | undefined, key: string = requiredSecret()): string | null {
  if (!token) return null;

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const id = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expected = hmac(id, key);

  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length === 0 || expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  return id;
}

// Reads and verifies the cart_token cookie. Read-only (never sets a cookie), so it's safe to call
// from a Server Component render; renders inside <Suspense> since it reads cookies().
export async function getGuestToken(): Promise<string | null> {
  const store = await cookies();
  return verifyGuestToken(store.get(CART_TOKEN_COOKIE)?.value);
}

// Returns the current guest id, creating and persisting a new signed cart_token cookie when
// missing or invalid. Mutates cookies(), so only callable from a Server Action or Route Handler.
export async function ensureGuestToken(): Promise<string> {
  const existing = await getGuestToken();
  if (existing) return existing;

  const id = randomUUID();
  const store = await cookies();
  store.set(CART_TOKEN_COOKIE, signGuestToken(id), {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: true,
  });
  return id;
}
