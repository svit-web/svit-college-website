import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { formatDate } from "@/components/site-next/DepartmentSections";
import {
  achievementCategoryLabel,
  getAchievementDetailBySlug,
} from "@/lib/achievements.functions";

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
    description: item.description?.slice(0, 155) ?? undefined,
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
    <div className="bg-white">
      <div className="container-page flex items-center gap-1.5 pb-2 pt-[clamp(150px,18vh,200px)] text-xs text-muted-foreground">
        <Link href="/" className="hover:text-navy transition-colors">
          Home
        </Link>
        {dept && (
          <>
            <span>/</span>
            <Link href={`/departments/${dept.code}`} className="hover:text-navy transition-colors">
              {dept.name}
            </Link>
            <span>/</span>
            <Link
              href={`/departments/${dept.code}/achievements`}
              className="hover:text-navy transition-colors"
            >
              Achievements
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-navy font-medium truncate">{item.title}</span>
      </div>

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
