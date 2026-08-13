import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollegeLandingPage, type College } from "@/components/site-next/CollegeLandingPage";
import { getCollegeBySlug, getDepartmentsByCollegeSlug } from "@/lib/colleges.functions";
import { getGlobalHomepageItems, getCollegeHomepageItems, getRecruiterLogos } from "@/lib/homepage.functions";
import { getHeroAppearance } from "@/lib/theme.functions";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme";

type HomepageItems = Awaited<ReturnType<typeof getGlobalHomepageItems>>;

function byType(items: HomepageItems, type: string) {
  return items.filter((i) => i.item_type === type);
}

async function loadCollege(slug: string) {
  const [dbCollege, departments, globalItems, collegeItems, recruiters, appearance] = await Promise.all([
    getCollegeBySlug(slug),
    getDepartmentsByCollegeSlug(slug),
    getGlobalHomepageItems(),
    getCollegeHomepageItems(slug),
    getRecruiterLogos(),
    getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
  ]);
  if (!dbCollege) return null;

  function resolve(type: string) {
    const specific = byType(collegeItems, type);
    return specific.length > 0 ? specific : byType(globalItems, type);
  }

  const stats = resolve("stat").map((s) => ({ value: s.title, label: s.subtitle ?? "" }));
  const whyChoose = resolve("why_choose").map((w) => ({ title: w.title, desc: w.body ?? "", icon: w.icon_name ?? "BadgeCheck" }));
  const trustBadges = resolve("trust_badge").map((t) => ({ label: t.title, icon: t.icon_name ?? "BadgeCheck" }));

  const heroItem = resolve("hero")[0];

  const college: College = {
    id: dbCollege.slug as any,
    name: dbCollege.name,
    shortCode: dbCollege.code,
    tagline: dbCollege.tagline ?? '',
    logo: dbCollege.logo_url ?? '',
    route: `/colleges/${dbCollege.slug}`,
    hero: {
      kicker: dbCollege.hero_kicker ?? '',
      subhead: dbCollege.hero_subhead ?? '',
      imageUrl: heroItem?.image_url ?? null,
    },
    stats: stats.length > 0 ? stats : null,
    whyChoose: whyChoose.length > 0 ? whyChoose : null,
    trustBadges,
    recruiters: recruiters.map((r) => r.company_name),
    departments: departments as any,
  };

  return { college, appearance };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ college: string }>;
}): Promise<Metadata> {
  const { college: slug } = await params;
  const result = await loadCollege(slug);
  if (!result) {
    return { title: "College not found — SVIT Group", robots: { index: false } };
  }
  const { college } = result;
  const title = `${college.name} (${college.shortCode}) — SVIT Group`;
  const description = `${college.shortCode} — ${college.tagline}. ${college.hero.subhead}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CollegePage({
  params,
}: {
  params: Promise<{ college: string }>;
}) {
  const { college: slug } = await params;
  const result = await loadCollege(slug);
  if (!result) notFound();

  return <CollegeLandingPage college={result.college} appearance={result.appearance} />;
}
