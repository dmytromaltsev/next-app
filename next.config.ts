import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /** AVIF/WebP from `next/image` + longer cache for optimized URLs in prod. */
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
