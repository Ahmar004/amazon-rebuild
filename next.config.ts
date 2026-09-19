import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Partial Prerendering: cached static shells, per-user parts streamed (docs/tech-stack.md section 3).
  cacheComponents: true,
  images: {
    // Product and brand images come pre-sized from Amazon's CDN; Vercel optimisation is capped on Hobby.
    unoptimized: true,
  },
};

export default nextConfig;
