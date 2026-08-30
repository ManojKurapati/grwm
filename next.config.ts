import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The demo is presented from a dev server; the floating dev badge is noise.
  devIndicators: false,

  // Product photography comes from Context.dev's media CDN, and wardrobe
  // uploads are served from Convex file storage. Both are remote hosts, so
  // they're declared here for any use of next/image.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.brand.dev" },
      { protocol: "https", hostname: "*.convex.cloud" },
    ],
  },
};

export default nextConfig;
