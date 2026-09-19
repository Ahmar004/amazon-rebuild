import type { MetadataRoute } from "next";

// Keeps every crawler out of the demo clone (docs/spec.md section 2, safety notice).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
