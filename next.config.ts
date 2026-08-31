import type { NextConfig } from "next";
import os from "node:os";

// Discover this machine's own LAN IP(s) at startup instead of hardcoding one.
// A hardcoded IP only works on whoever's network it was written on — it
// breaks the moment anyone else (a different network, a professor testing
// the repo, a teammate) runs `next dev` from a different address. Without
// this, requests to the dev server from any device other than the host
// itself (including the host's own LAN IP, which is what a phone/second PC
// on the same network sees) get 403'd by Next's dev-origin protection —
// the page navigation still loads, but static assets like locally-imported
// images fail, since they're fetched with a Referer that no longer matches.
function localNetworkOrigins(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        addresses.push(entry.address);
      }
    }
  }
  return addresses;
}

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
      {
        protocol: "https",
        hostname: "media.konfhub.com",
      },
    ],
  },

  // Typed routes disabled during the route port: Header/Footer link to many
  // pages that don't exist as Next.js routes yet (About/Admissions/Campus
  // Life/etc sub-pages). Re-enable once nav coverage matches actual routes.
  typedRoutes: false,

  // Allow dev server access from localhost plus whatever LAN IP(s) this
  // machine currently has, so other devices on the same network (a phone,
  // another PC) can reach it too — see localNetworkOrigins() above.
  allowedDevOrigins: ["localhost", "127.0.0.1", ...localNetworkOrigins()],
};

export default nextConfig;
