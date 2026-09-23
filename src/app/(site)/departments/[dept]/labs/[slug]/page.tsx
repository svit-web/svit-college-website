import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getLabBySlug } from "@/lib/facilities.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";

// Per-request dedupe between generateMetadata and the page.
const loadLab = cache(async (deptCode: string, slug: string) => {
  const department = await getDepartmentByCode(deptCode.toUpperCase()).catch(() => null);
  if (!department) return null;
  const lab = await getLabBySlug(department.id, slug).catch(() => null);
  if (!lab || !lab.has_detail_page) return null;
  const album = await getEntryAlbum(lab.album_id);
  return { department, lab, album };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string; slug: string }>;
}): Promise<Metadata> {
  const { dept, slug } = await params;
  const result = await loadLab(dept, slug);
  if (!result) return { title: "Lab — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.lab.name} — Labs — SVIT Vasad`,
    description: result.lab.description?.slice(0, 155) ?? undefined,
  };
}

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ dept: string; slug: string }>;
}) {
  const { dept, slug } = await params;
  const result = await loadLab(dept, slug);
  if (!result) notFound();

  const { department, lab, album } = result;
  const highlights = lab.metadata?.highlights ?? [];

  return (
    <div className="bg-white">
      <div className="container-page flex items-center gap-1.5 pb-2 pt-[clamp(150px,18vh,200px)] text-xs text-muted-foreground">
        <Link href="/" className="hover:text-navy transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/departments/${department.code}`}
          className="hover:text-navy transition-colors"
        >
          {department.name}
        </Link>
        <span>/</span>
        <Link
          href={`/departments/${department.code}/labs`}
          className="hover:text-navy transition-colors"
        >
          Labs
        </Link>
        <span>/</span>
        <span className="text-navy font-medium truncate">{lab.name}</span>
      </div>

      <div className="container-page max-w-4xl pb-16 pt-6">
        <DetailPageLayout
          entry={{
            title: lab.name,
            subtitle: lab.subtitle,
            accent: lab.accent_color || "Laboratory",
            description: lab.description,
            cardPhotoUrl: lab.card_photo_url,
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
      </div>
    </div>
  );
}
