// Password hashing (docs/design.md 5.2, CLAUDE.md security rule: "Passwords are hashed with
// bcryptjs (cost 10) and never logged or returned"). Pure wrappers around bcryptjs so
// lib/data/users.ts and actions/auth.ts never touch bcrypt directly.
import bcrypt from "bcryptjs";

const COST = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
