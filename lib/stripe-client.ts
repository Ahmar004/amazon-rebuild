"use client";

// The browser-side Stripe singleton, loaded once from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// (CLAUDE.md: "The publishable key comes from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY").
import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}
