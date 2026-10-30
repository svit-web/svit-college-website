import type { NextConfig } from "next";
import os from "node:os";
import withBundleAnalyzerInit from "@next/bundle-analyzer";

// Off by default — zero effect on `next build`/`next dev` normally. Run
// `ANALYZE=true npm run build` to get an interactive treemap of what's
// actually in each route's JS bundle (opens in the browser after the build).
// See optimization_plan.md B5.
const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === "true",
});

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
  // Self-hosted production target. Skipped on Vercel: Vercel's build step
  // expects the normal .next output (per-page .nft.json trace files), not
  // the bundled standalone server — setting this there breaks the build
  // with ENOENT on .next/next-server.js.nft.json.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),

  // Image optimization for self-hosted
  images: {
    // Some networks resolve *.supabase.co over DNS64 to a NAT64 (64:ff9b::/96)
    // address, which Next's SSRF guard misreads as a private IP and blocks.
    // Safe to bypass here since remotePatterns below already locks fetches
    // to trusted hostnames only.
    dangerouslyAllowLocalIP: true,
    // Several department/college logos are SVGs (e.g. dept-ce.svg). Next blocks
    // SVG optimization by default (XSS risk from untrusted sources); the CSP
    // below neutralizes that since all sources are our own trusted storage.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.svit.qzz.io",
      },
      {
        protocol: "https",
        hostname: "db.svitvasad.ac.in",
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

  // Pages that moved or were merged away — keep the old URLs reachable.
  async redirects() {
    return [
      // Clubs and Societies were combined into one Campus Life section.
      { source: "/campus-life/clubs", destination: "/campus-life/student-groups", permanent: true },
      { source: "/student-corner", destination: "/campus-life/student-groups", permanent: true },
      // The CoE moved into Campus Life as its own tab.
      {
        source: "/student-corner/coe",
        destination: "/campus-life/centre-of-excellence",
        permanent: true,
      },
      { source: "/coe", destination: "/campus-life/centre-of-excellence", permanent: true },
      // Central Facilities moved out of About into Campus Life.
      { source: "/about/facilities", destination: "/campus-life/facilities", permanent: true },
      // Central Library got its own page; the generic facility leaf URL points there.
      {
        source: "/campus-life/facilities/:category/library",
        destination: "/campus-life/central-library",
        permanent: true,
      },
      // /campus was an orphaned page with no inbound links; its content lives in Campus Life now.
      { source: "/campus", destination: "/campus-life/facilities", permanent: true },
      // Alumni relations moved to a dedicated external portal.
      { source: "/alumni", destination: "https://alumni.svitvasad.ac.in", permanent: true },

      // Pre-migration ASP.NET site (pre-2026). Google still has these indexed/crawling
      // them (Search Console shows active crawl attempts) and they were 404ing, which
      // both breaks visitors following old links/bookmarks and stops the old page's
      // ranking signal from reaching its replacement. Mapped from a Wayback Machine
      // crawl of svitvasad.ac.in 2023-2026. Only mapped where the destination is
      // unambiguous; anything uncertain is left to 404 and age out of the index.
      { source: "/Home", destination: "/", permanent: true },
      { source: "/Home/Index", destination: "/", permanent: true },
      { source: "/Home/Admissions", destination: "/admissions", permanent: true },
      { source: "/Home/Career", destination: "/careers", permanent: true },
      { source: "/Home/Facilities", destination: "/campus-life/facilities", permanent: true },
      { source: "/Home/OnlineFees", destination: "/admissions/intake-fees", permanent: true },
      { source: "/Home/Placement", destination: "/placement", permanent: true },
      { source: "/Home/TheCollege", destination: "/about/history-vision-mission", permanent: true },
      {
        source: "/Home/AlumniRegistrationForm",
        destination: "https://alumni.svitvasad.ac.in",
        permanent: true,
      },
      // Numeric staff IDs don't map to the new employee_code-based /staff/[staff]
      // slugs, so these go to the staff directory rather than a per-person guess.
      { source: "/Home/StaffDetails/:id", destination: "/staff", permanent: true },

      { source: "/arch.php", destination: "/colleges/svit-coa", permanent: true },
      { source: "/Architecture", destination: "/colleges/svit-coa", permanent: true },
      { source: "/Architecture/Index", destination: "/colleges/svit-coa", permanent: true },
      { source: "/Architecture/TheCollege", destination: "/colleges/svit-coa", permanent: true },
      { source: "/Architecture/Academics", destination: "/courses/architecture", permanent: true },
      { source: "/Architecture/People", destination: "/departments/ARCH/staff", permanent: true },

      { source: "/Engineering", destination: "/colleges/svit-degree", permanent: true },
      { source: "/Engineering/Index", destination: "/colleges/svit-degree", permanent: true },
      { source: "/Engineering/AboutUs", destination: "/colleges/svit-degree", permanent: true },
      { source: "/Engineering/Civil", destination: "/departments/CIV", permanent: true },
      { source: "/Engineering/Computer", destination: "/departments/CE", permanent: true },
      { source: "/Engineering/Electrical", destination: "/departments/EE", permanent: true },
      { source: "/Engineering/Mechanical", destination: "/departments/ME", permanent: true },
      {
        source: "/Engineering/InformationTechnology",
        destination: "/departments/IT",
        permanent: true,
      },
      {
        source: "/Engineering/ElectronicsAndCommunication",
        destination: "/departments/EC",
        permanent: true,
      },
      { source: "/Engineering/Aeronautical", destination: "/departments/AE", permanent: true },
      {
        source: "/Engineering/AppliedScienceAndHumanities",
        destination: "/departments/ASH01",
        permanent: true,
      },
      { source: "/Engineering/Events", destination: "/campus-life/events", permanent: true },
      { source: "/Engineering/Gallery", destination: "/gallery", permanent: true },
      { source: "/Engineering/Placement", destination: "/placement", permanent: true },
      {
        source: "/Engineering/StudentActivity",
        destination: "/campus-life/student-groups",
        permanent: true,
      },

      { source: "/MCA", destination: "/colleges/svica", permanent: true },
      { source: "/MCA/Index", destination: "/colleges/svica", permanent: true },
      { source: "/MCA/AboutMCA", destination: "/colleges/svica", permanent: true },
      { source: "/MCA/AboutSVIT", destination: "/about/history-vision-mission", permanent: true },
      { source: "/MCA/Events", destination: "/campus-life/events", permanent: true },
      { source: "/MCA/Placement", destination: "/placement", permanent: true },
      {
        source: "/MCA/StudentActivity",
        destination: "/campus-life/student-groups",
        permanent: true,
      },

      { source: "/MBA/AboutMBA", destination: "/colleges/svit-mba", permanent: true },
      { source: "/MBA/Facilities", destination: "/campus-life/facilities", permanent: true },
      { source: "/MBA/Gallery", destination: "/gallery", permanent: true },

      { source: "/Diploma/AboutDiploma", destination: "/colleges/diploma", permanent: true },
      { source: "/Diploma/Facilities", destination: "/campus-life/facilities", permanent: true },
      { source: "/Diploma/Gallery", destination: "/gallery", permanent: true },

      {
        source: "/Nursing/AboutNursing",
        destination: "/colleges/sardar-vallabhbhai-patel-institute-of-nursing",
        permanent: true,
      },
      {
        source: "/Nursing/AboutSVIT",
        destination: "/about/history-vision-mission",
        permanent: true,
      },
      { source: "/Nursing/Facilities", destination: "/campus-life/facilities", permanent: true },
      { source: "/Nursing/Gallery", destination: "/gallery", permanent: true },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
