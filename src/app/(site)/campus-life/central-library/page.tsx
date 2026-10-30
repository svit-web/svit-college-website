import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { CentralLibrarySections } from "@/components/site-next/CentralLibrarySections";
import { getLibraryPage, LIBRARY_PATH } from "@/lib/library.functions";
import { metaDescription } from "@/lib/seo";

// ISR, same as the facility leaf pages: admin writes still show immediately
// via revalidatePublicSite()'s revalidatePath('/', 'layout').
export const revalidate = 300; // seconds

// Central Library has its own dedicated route (linked from the Campus Life
// tabs and mega menu), so it renders regardless of has_detail_page — same as
// NSS / NCC. Content: the 'library' facilities row + library_* tables.
const loadLibrary = cache(() => getLibraryPage().catch(() => null));

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadLibrary();
  if (!data) return { title: "Central Library — SVIT Vasad", robots: { index: false } };
  return {
    title: `${data.facility.name} — Campus Life — SVIT Vasad`,
    description: metaDescription(data.facility.description),
    alternates: { canonical: LIBRARY_PATH },
  };
}

export default async function CentralLibraryPage() {
  const data = await loadLibrary();
  if (!data) notFound();

  const { facility, album } = data;

  return (
    <DetailPageLayout
      entry={{
        title: facility.name,
        subtitle: facility.subtitle,
        accent: facility.accent_color || "Academic Facility",
        description: facility.description,
        cardPhotoUrl: album?.coverUrl ?? facility.card_photo_url,
        album,
      }}
    >
      <CentralLibrarySections data={data} />
    </DetailPageLayout>
  );
}
