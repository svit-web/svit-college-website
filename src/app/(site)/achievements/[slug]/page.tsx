import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { formatDate } from "@/components/site-next/DepartmentSections";
import { ChevronRight } from "lucide-react";
import {
  achievementCategoryLabel,
  getAchievementDetailBySlug,
} from "@/lib/achievements.functions";
import { metaDescription } from "@/lib/seo";

// Per-request dedupe between generateMetadata and the page.
const loadAchievement = cache((slug: string) =>
  getAchievementDetailBySlug(slug).catch(() => null),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadAchievement(slug);
  if (!item) return { title: "Achievement not found — SVIT Vasad", robots: { index: false } };
  return {
    title: `${item.title} — Achievements — SVIT Vasad`,
    description: metaDescription(item.description),
    alternates: { canonical: `/achievements/${item.slug}` },
  };
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await loadAchievement(slug);
  if (!item) notFound();

  const dept = item.department;

  return (
    <div className="bg-paper">
      <nav
        aria-label="Breadcrumb"
        className="container-page flex flex-wrap items-center gap-1.5 pb-6 pt-[clamp(112px,16vh,180px)] text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-mute"
      >
        <Link href="/" className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
          Home
        </Link>
        {dept && (
          <>
            <ChevronRight aria-hidden className="h-3 w-3" />
            <Link href={`/departments/${dept.code}`} className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson">
              {dept.name}
            </Link>
            <ChevronRight aria-hidden className="h-3 w-3" />
            <Link
              href={`/departments/${dept.code}/achievements`}
              className="-my-1.5 inline-block py-1.5 transition-colors hover:text-crimson"
            >
              Achievements
            </Link>
          </>
        )}
        <ChevronRight aria-hidden className="h-3 w-3" />
        <span aria-current="page" className="truncate text-ink-soft">{item.title}</span>
      </nav>

      <div className="container-page max-w-4xl pb-16 pt-6">
        <DetailPageLayout
          entry={{
            title: item.title,
            accent: `${achievementCategoryLabel(item.category)} Achievement`,
            subtitle: [formatDate(item.date), dept?.name].filter(Boolean).join(" · "),
            description: item.description,
            cardPhotoUrl: item.cardPhotoUrl,
            album: item.album,
          }}
        />
      </div>
    </div>
  );
}
