import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllFacilities, getFacilityBySlug } from "@/lib/facilities.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";
import { metaDescription } from "@/lib/seo";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

export async function generateStaticParams() {
  const facilities = await getAllFacilities().catch(() => []);
  // Mirrors pathFor() in the facilities index page: "academic" gets its own
  // prefix, everything else falls under "amenities".
  return facilities
    .filter((f) => f.has_detail_page)
    .map((f) => ({ slug: [f.category === "academic" ? "academic" : "amenities", f.slug] }));
}

// Per-request dedupe between generateMetadata and the page. Handles both
// /academic/slug and /co-curriculum/slug — the real slug is always the last
// path segment, matching the original splat-route logic.
const loadFacility = cache(async (segments: string[]) => {
  const slug = segments[segments.length - 1];
  const facility = await getFacilityBySlug(slug).catch(() => null);
  if (!facility || !facility.has_detail_page) return null;
  const album = await getEntryAlbum(facility.album_id);
  return { facility, album };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadFacility(slug);
  if (!result) return { title: "Facility — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.facility.name} — Facilities — SVIT Vasad`,
    description: metaDescription(result.facility.description),
    alternates: { canonical: `/campus-life/facilities/${result.facility.category}/${result.facility.slug}` },
  };
}

export default async function FacilityLeaf({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const result = await loadFacility(slug);
  if (!result) notFound();

  const { facility, album } = result;
  const highlights = facility.metadata?.highlights ?? [];

  return (
    <DetailPageLayout
      entry={{
        title: facility.name,
        subtitle: facility.subtitle,
        accent: facility.accent_color || "Facility",
        description: facility.description,
        cardPhotoUrl: album?.coverUrl ?? null,
        album,
      }}
    >
      {highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.04}>
                <div className="h-full border border-line bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep text-xs font-bold text-navy">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-display font-medium text-navy">{h.title}</div>
                      <p className="mt-1 text-sm text-ink-soft">{h.description}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </DetailPageLayout>
  );
}
