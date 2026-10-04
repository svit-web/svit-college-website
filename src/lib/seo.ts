// Shared SEO helpers: the canonical site origin, the site-wide Open Graph
// base, admin `seo_metadata` overrides, and JSON-LD builders.
//
// Next.js merges Metadata objects *shallowly* — a page that sets its own
// `openGraph` replaces the root one entirely. Pages that need a custom
// `openGraph` therefore spread `await siteOpenGraph()` first so they keep the
// site name and default share image.
import type { Metadata } from "next";
import { DEFAULT_MISC, getMiscSettings, type MiscSettings } from "@/lib/site-settings.functions";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://svitvasad.ac.in").replace(
  /\/+$/,
  "",
);
export const SITE_NAME = "SVIT Vasad — Sardar Vallabhbhai Institute of Technology";
const DEFAULT_OG_IMAGE = "/og-image.jpg";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Site-wide Open Graph base. The share image is the admin-set one
 * (Settings → OG Image), else the bundled default. Pass `misc` when the
 * caller already fetched it.
 */
export async function siteOpenGraph(
  misc?: MiscSettings,
): Promise<NonNullable<Metadata["openGraph"]>> {
  const settings = misc ?? (await getMiscSettings().catch(() => DEFAULT_MISC));
  return {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [settings.og_image_url || DEFAULT_OG_IMAGE],
  };
}

/**
 * Turns admin-entered rich text into a meta description: strips HTML and
 * markdown markers, collapses whitespace, and trims to ~155 chars on a word
 * boundary. Returns undefined for empty input so the parent's description
 * is inherited instead of emitting an empty tag.
 */
export function metaDescription(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined;
  const plain = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>~]+/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return undefined;
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Row shape of the `seo:seo_metadata(...)` embed on posts/events. */
export interface SeoOverride {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots_directives: string | null;
}

export const SEO_OVERRIDE_SELECT =
  "seo:seo_metadata(meta_title, meta_description, og_title, og_description, og_image_url, canonical_url, robots_directives)";

/** Parses the admin's free-text robots field ("noindex, nofollow"). */
export function parseRobots(directives: string | null | undefined): Metadata["robots"] {
  if (!directives) return undefined;
  const d = directives.toLowerCase();
  return { index: !d.includes("noindex"), follow: !d.includes("nofollow") };
}

// ── JSON-LD ────────────────────────────────────────────────────────────────

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

interface OrganizationInput {
  phone: string | null;
  email: string | null;
  address: string | null;
  socialLinks: Record<string, string>;
  logoUrl: string | null;
}

export function organizationJsonLd({
  phone,
  email,
  address,
  socialLinks,
  logoUrl,
}: OrganizationInput) {
  const sameAs = Object.values(socialLinks ?? {}).filter((u) => /^https?:\/\//.test(u));
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    "@id": ORGANIZATION_ID,
    name: "Sardar Vallabhbhai Institute of Technology",
    alternateName: "SVIT Vasad",
    url: SITE_URL,
    logo: absoluteUrl(logoUrl || "/icon.png"),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    address: {
      "@type": "PostalAddress",
      ...(address && { streetAddress: address }),
      addressLocality: "Vasad",
      addressRegion: "Gujarat",
      postalCode: "388306",
      addressCountry: "IN",
    },
    ...(sameAs.length > 0 && { sameAs }),
  };
}

interface ArticleInput {
  title: string;
  url: string;
  description?: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export function newsArticleJsonLd({
  title,
  url,
  description,
  image,
  publishedAt,
  updatedAt,
}: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title.slice(0, 110),
    mainEntityOfPage: absoluteUrl(url),
    ...(description && { description }),
    ...(image && { image: [absoluteUrl(image)] }),
    ...(publishedAt && { datePublished: publishedAt }),
    ...((updatedAt || publishedAt) && { dateModified: updatedAt || publishedAt }),
    publisher: { "@id": ORGANIZATION_ID },
    author: { "@id": ORGANIZATION_ID },
  };
}

interface EventInput {
  title: string;
  url: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
  image?: string | null;
  location?: string | null;
}

export function eventJsonLd({
  title,
  url,
  startDate,
  endDate,
  description,
  image,
  location,
}: EventInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    url: absoluteUrl(url),
    startDate,
    ...(endDate && { endDate }),
    ...(description && { description }),
    ...(image && { image: [absoluteUrl(image)] }),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: location || "SVIT Vasad campus",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Vasad",
        addressRegion: "Gujarat",
        postalCode: "388306",
        addressCountry: "IN",
      },
    },
    organizer: { "@id": ORGANIZATION_ID },
  };
}
