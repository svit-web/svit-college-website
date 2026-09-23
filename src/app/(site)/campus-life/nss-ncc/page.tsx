import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getCenterBySlug } from "@/lib/centers.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";

// NSS/NCC has its own dedicated top-level route (not reached via a Card), so
// it always renders regardless of has_detail_page.
async function loadNssNcc() {
  const center = await getCenterBySlug("nss-ncc");
  if (!center) return null;
  const album = await getEntryAlbum(center.album_id);
  return { center, album };
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await loadNssNcc();
  if (!result) return { title: "NSS / NCC — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.center.name} — Campus Life — SVIT Vasad`,
    description: (result.center.description || "").slice(0, 155),
  };
}

export default async function NssNccPage() {
  const result = await loadNssNcc();
  if (!result) notFound();

  const { center, album } = result;
  const highlights = center.metadata?.highlights ?? [];

  return (
    <DetailPageLayout
      entry={{
        title: center.name,
        subtitle: center.subtitle,
        accent: center.accent_color || "Centre",
        description: center.description,
        cardPhotoUrl: center.card_photo_url,
        album,
      }}
    >
      {highlights.length > 0 && (
        <div>
          <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {highlights.map((h, i) => (
              <Reveal key={h.title} delay={i * 0.04}>
                <div className="card-lift h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-display font-bold text-navy">{h.title}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
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
