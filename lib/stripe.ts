// The one place STRIPE_SECRET_KEY is read (CLAUDE.md: "STRIPE_SECRET_KEY stays server-only").
// `server-only` makes any accidental client-component import a build error.
import "server-only";
import Stripe from "stripe";

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

export const stripe = new Stripe(secretKey());
