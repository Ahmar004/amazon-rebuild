import type { MetadataRoute } from "next";

// Keeps every crawler out of the demo store.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
