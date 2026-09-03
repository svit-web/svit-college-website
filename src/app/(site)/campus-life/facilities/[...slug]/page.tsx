import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { LibraryPage } from "@/components/site-next/LibraryPage";
import { getFacilityBySlug } from "@/lib/facilities.functions";
import { getAllColleges } from "@/lib/colleges.functions";

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
    highlights: facility.metadata?.highlights ?? [],
    institute_libraries: facility.metadata?.institute_libraries ?? [],
    gallery: facility.metadata?.gallery ?? {},
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

export default async function FacilityLeaf({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const item = await loadFacility(slug);
  if (!item) notFound();

  if (item.slug === "library") {
    const colleges = await getAllColleges().catch(() => []);
    const countByCollegeId = new Map(item.institute_libraries.map((l) => [l.college_id, l.book_count]));
    const institutes = colleges.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      slug: c.slug,
      logoUrl: c.logo_url,
      tagline: c.tagline,
      bookCount: countByCollegeId.get(c.id) ?? 0,
    }));

    const photos = (item.gallery.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      focalX: img.focalX,
      focalY: img.focalY,
    }));

    return (
      <LibraryPage
        title={item.title}
        subtitle={item.subtitle}
        accent={item.accent}
        description={item.description}
        highlights={item.highlights}
        institutes={institutes}
        photos={photos}
      />
    );
  }

  return <CampusLeafPage item={item} />;
}
