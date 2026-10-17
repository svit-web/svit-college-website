import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllDepartments, getDepartmentByCode } from "@/lib/departments.functions";
import { getLabBySlug, getLabsByDepartmentId } from "@/lib/facilities.functions";
import { ChevronRight } from "lucide-react";
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
  const departments = await getAllDepartments().catch(() => []);
  const perDept = await Promise.all(
    departments.map(async (d) => {
      const labs = await getLabsByDepartmentId(d.id).catch(() => []);
      return labs
        .filter((l) => l.has_detail_page && typeof l.slug === "string" && l.slug.length > 0)
        .map((l) => ({ dept: d.code, slug: l.slug }));
    }),
  );
  return perDept.flat();
}

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
    description: metaDescription(result.lab.description),
    alternates: { canonical: `/departments/${result.department.code}/labs/${result.lab.slug}` },
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
    <div className="bg-paper">
      <nav
        aria-label="Breadcrumb"
        className="container-page flex flex-wrap items-center gap-1.5 pb-6 pt-[clamp(112px,16vh,180px)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute"
      >
        <Link href="/" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
          Home
        </Link>
        <ChevronRight aria-hidden className="h-3 w-3" />
        <Link
          href={`/departments/${department.code}`}
          className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson"
        >
          {department.name}
        </Link>
        <ChevronRight aria-hidden className="h-3 w-3" />
        <Link
          href={`/departments/${department.code}/labs`}
          className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson"
        >
          Labs
        </Link>
        <ChevronRight aria-hidden className="h-3 w-3" />
        <span aria-current="page" className="truncate text-ink-soft">
          {lab.name}
        </span>
      </nav>

      <div className="container-page max-w-4xl pb-16 pt-6">
        <DetailPageLayout
          entry={{
            title: lab.name,
            subtitle: lab.subtitle,
            accent: lab.accent_color || "Laboratory",
            description: lab.description,
            cardPhotoUrl: album?.coverUrl ?? null,
            album,
          }}
        >
          {highlights.length > 0 && (
            <div>
              <SectionHeading
                eyebrow="Highlights"
                title="What makes it special"
                variant="eyebrow"
              />
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
      </div>
    </div>
  );
}
