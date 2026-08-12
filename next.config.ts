import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosted production target
  output: "standalone",

  // Image optimization for self-hosted
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Enable typed routes
  typedRoutes: true,
};

export default nextConfig;
