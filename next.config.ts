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

  // Typed routes disabled during the route port: Header/Footer link to many
  // pages that don't exist as Next.js routes yet (About/Admissions/Campus
  // Life/etc sub-pages). Re-enable once nav coverage matches actual routes.
  typedRoutes: false,

  // Allow dev server access from localhost
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
