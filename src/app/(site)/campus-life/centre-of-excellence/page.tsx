import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { CenterPageSections } from "@/components/site-next/CenterPageSections";
import { COE_PATH, COE_SLUG, getCenterPage } from "@/lib/center-page.functions";
import { metaDescription } from "@/lib/seo";

// ISR, same as Central Library: admin writes still show immediately via
// revalidatePublicSite()'s revalidatePath('/', 'layout').
export const revalidate = 300; // seconds

// The CoE has its own dedicated route (Campus Life tab + mega menu), so it
// renders regardless of has_detail_page. Content: the 'coe' centers row +
// center_* tables and the MoUs / events / achievements tagged to it.
const loadCoe = cache(() => getCenterPage(COE_SLUG).catch(() => null));

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadCoe();
  if (!data) return { title: "Centre of Excellence — SVIT Vasad", robots: { index: false } };
  return {
    title: `${data.center.name} — Campus Life — SVIT Vasad`,
    description: metaDescription(data.center.description),
    alternates: { canonical: COE_PATH },
  };
}

export default async function CentreOfExcellencePage() {
  const data = await loadCoe();
  if (!data) notFound();

  const { center, album } = data;

  return (
    <DetailPageLayout
      entry={{
        title: center.name,
        subtitle: center.subtitle,
        accent: center.accent_color || "Centre of Excellence",
        description: center.description,
        cardPhotoUrl: album?.coverUrl ?? center.card_photo_url,
        album,
      }}
    >
      <CenterPageSections data={data} />
    </DetailPageLayout>
  );
}
