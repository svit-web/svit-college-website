import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { PageHero } from "@/components/site-next/PageHero";
import { PillTabs } from "@/components/site-next/PillTabs";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getVisibleCenters, getCenterBySlug } from "@/lib/centers.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";

async function loadCentre(slug: string) {
  const [item, allCenters] = await Promise.all([getCenterBySlug(slug), getVisibleCenters()]);
  if (!item || !item.has_detail_page) return null;
  const album = await getEntryAlbum(item.album_id);
  return { item, allCenters, album };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadCentre(slug);
  if (!result) return { title: "Societies — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.item.name} — Societies — SVIT Vasad`,
    description: (result.item.description || "").slice(0, 155),
  };
}

export default async function CentreLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadCentre(slug);
  if (!result) notFound();

  const { item, allCenters, album } = result;
  const highlights = item.metadata?.highlights ?? [];

  return (
    <>
      <PageHero
        title="Societies"
        accent="Beyond the Classroom"
        subtitle="Centres, cells and chapters where students grow beyond the syllabus."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Societies", to: "/campus-life/student-groups" },
          { label: item.name },
        ]}
      />

      <section className="container-page py-20">
        <PillTabs
          ariaLabel="Centres"
          items={allCenters.map((c) => ({
            label: c.name.split("(")[0].trim(),
            to: `/student-corner/${c.slug}`,
          }))}
        />
        <DetailPageLayout
          entry={{
            title: item.name,
            subtitle: item.subtitle,
            accent: item.accent_color || "Centre",
            description: item.description,
            cardPhotoUrl: item.card_photo_url,
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
      </section>
    </>
  );
}
