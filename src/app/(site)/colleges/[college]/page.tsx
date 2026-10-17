import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollegeLandingPage, type College } from "@/components/site-next/CollegeLandingPage";
import { getAllColleges, getCollegeBySlug, getDepartmentsByCollegeSlug } from "@/lib/colleges.functions";
import {
  getGlobalHomepageItems,
  getCollegeHomepageItems,
  getRecruiterLogos,
} from "@/lib/homepage.functions";
import { getHeroAppearance } from "@/lib/theme.functions";
import { DEFAULT_HERO_APPEARANCE } from "@/lib/theme";
import { DEFAULT_MISC, getMiscSettings } from "@/lib/site-settings.functions";
import { ORGANIZATION_ID, SITE_URL, absoluteUrl, metaDescription } from "@/lib/seo";
import { JsonLd } from "@/components/site-next/JsonLd";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

// Without this, `revalidate` alone has no effect on a dynamic-segment page —
// Next still renders it fresh on every request (confirmed: response came
// back `Cache-Control: no-store` until this was added). Prerendering the
// known colleges at build time is what actually makes `revalidate` apply.
export async function generateStaticParams() {
  const colleges = await getAllColleges().catch(() => []);
  return colleges.map((c) => ({ college: c.slug }));
}

type HomepageItems = Awaited<ReturnType<typeof getGlobalHomepageItems>>;

function byType(items: HomepageItems, type: string) {
  return items.filter((i) => i.item_type === type);
}

async function loadCollege(slug: string) {
  const [dbCollege, departments, globalItems, collegeItems, recruiters, appearance, misc] =
    await Promise.all([
      getCollegeBySlug(slug),
      getDepartmentsByCollegeSlug(slug),
      getGlobalHomepageItems(),
      getCollegeHomepageItems(slug),
      getRecruiterLogos(),
      getHeroAppearance().catch(() => DEFAULT_HERO_APPEARANCE),
      getMiscSettings().catch(() => DEFAULT_MISC),
    ]);
  if (!dbCollege) return null;

  function resolve(type: string) {
    const specific = byType(collegeItems, type);
    return specific.length > 0 ? specific : byType(globalItems, type);
  }

  const stats = resolve("stat").map((s) => ({ value: s.title, label: s.subtitle ?? "" }));
  const whyChoose = resolve("why_choose").map((w) => ({
    title: w.title,
    desc: w.body ?? "",
    icon: w.icon_name ?? "BadgeCheck",
  }));
  const trustBadges = resolve("trust_badge").map((t) => ({
    label: t.title,
    icon: t.icon_name ?? "BadgeCheck",
  }));

  const heroItem = resolve("hero")[0];

  const college: College = {
    id: dbCollege.slug,
    name: dbCollege.name,
    shortCode: dbCollege.code,
    tagline: dbCollege.tagline ?? "",
    logo: dbCollege.logo_url ?? "",
    route: `/colleges/${dbCollege.slug}`,
    hero: {
      kicker: dbCollege.hero_kicker ?? "",
      subhead: dbCollege.hero_subhead ?? "",
      imageUrl: heroItem?.image_url ?? null,
    },
    stats: stats.length > 0 ? stats : null,
    whyChoose: whyChoose.length > 0 ? whyChoose : null,
    principal: dbCollege.principal_name
      ? {
          name: dbCollege.principal_name,
          title: dbCollege.principal_title ?? "",
          message: dbCollege.principal_message ?? "",
          photoUrl: dbCollege.principal_photo_url ?? null,
        }
      : null,
    trustBadges,
    recruiters,
    departments,
  };

  return { college, appearance, ctaLabel: misc.cta_button_label };
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
  return {
    title,
    description: metaDescription(`${college.shortCode} — ${college.tagline}. ${college.hero.subhead}`),
    alternates: { canonical: `/colleges/${slug}` },
  };
}

export default async function CollegePage({ params }: { params: Promise<{ college: string }> }) {
  const { college: slug } = await params;
  const result = await loadCollege(slug);
  if (!result) notFound();

  const { college } = result;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollegeOrUniversity",
          name: college.name,
          alternateName: college.shortCode,
          url: `${SITE_URL}/colleges/${slug}`,
          ...(college.logo && { logo: absoluteUrl(college.logo) }),
          description: metaDescription(`${college.tagline}. ${college.hero.subhead}`),
          parentOrganization: { "@id": ORGANIZATION_ID },
        }}
      />
      <CollegeLandingPage college={college} appearance={result.appearance} ctaLabel={result.ctaLabel} />
    </>
  );
}
