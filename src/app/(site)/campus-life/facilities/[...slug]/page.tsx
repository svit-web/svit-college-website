import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { getFacilityBySlug } from "@/lib/facilities.functions";

async function loadFacility(segments: string[]) {
  // Handles both /academic/slug and /co-curriculum/slug — the real slug is
  // always the last path segment, matching the original splat-route logic.
  const slug = segments[segments.length - 1];
  const facility = await getFacilityBySlug(slug);
  if (!facility) return null;

  return {
    slug: facility.slug,
    title: facility.name,
    subtitle: facility.subtitle || "",
    accent: facility.accent_color || "Facility",
    description: facility.description || "",
    highlights: Array.isArray((facility.metadata as any)?.highlights) ? (facility.metadata as any).highlights : [],
    image: null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadFacility(slug);
  if (!item) return { title: "Facility — SVIT Vasad", robots: { index: false } };
  return {
    title: `${item.title} — Facilities — SVIT Vasad`,
    description: item.description.slice(0, 155),
  };
}

export default async function FacilityLeaf({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const item = await loadFacility(slug);
  if (!item) notFound();

  return <CampusLeafPage item={item} />;
}
