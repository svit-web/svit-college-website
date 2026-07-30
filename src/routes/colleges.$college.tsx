import { createFileRoute, notFound } from "@tanstack/react-router";
import { CollegeLandingPage } from "@/components/site/CollegeLandingPage";
import { getCollegeBySlug, getDepartmentsByCollegeSlug } from "@/lib/colleges.functions";
import { getGlobalHomepageItems, getCollegeHomepageItems, getRecruiterLogos } from "@/lib/homepage.functions";
import { heroAppearanceQuery } from "@/lib/homepage";

export const Route = createFileRoute("/colleges/$college")({
  loader: async ({ params, context }) => {
    void context.queryClient.prefetchQuery(heroAppearanceQuery);

    const [dbCollege, departments, globalItems, collegeItems, recruiters] = await Promise.all([
      getCollegeBySlug({ data: params.college }),
      getDepartmentsByCollegeSlug({ data: params.college }),
      getGlobalHomepageItems(),
      getCollegeHomepageItems({ data: params.college }),
      getRecruiterLogos(),
    ]);
    if (!dbCollege) throw notFound();

    // For each item type, prefer college-specific items; fall back to global
    function byType(items: typeof globalItems, type: string) {
      return items.filter((i) => i.item_type === type);
    }
    function resolve(type: string) {
      const specific = byType(collegeItems, type);
      return specific.length > 0 ? specific : byType(globalItems, type);
    }

    const stats = resolve("stat").map((s) => ({ value: s.title, label: s.subtitle ?? "" }));
    const whyChoose = resolve("why_choose").map((w) => ({ title: w.title, desc: w.body ?? "", icon: w.icon_name ?? "BadgeCheck" }));
    const trustBadges = resolve("trust_badge").map((t) => ({ label: t.title, icon: t.icon_name ?? "BadgeCheck" }));

    const heroItem = resolve("hero")[0];

    const college = {
      id: dbCollege.slug as any,
      name: dbCollege.name,
      shortCode: dbCollege.metadata?.shortCode ?? dbCollege.code,
      tagline: dbCollege.metadata?.tagline ?? '',
      logo: dbCollege.logo_url ?? '',
      route: `/colleges/${dbCollege.slug}`,
      hero: {
        kicker: dbCollege.metadata?.hero?.kicker ?? '',
        subhead: dbCollege.metadata?.hero?.subhead ?? '',
        imageUrl: heroItem?.image_url ?? null,
      },
      stats: stats.length > 0 ? stats : null,
      whyChoose: whyChoose.length > 0 ? whyChoose : null,
      trustBadges,
      recruiters: recruiters.map((r) => r.company_name),
      departments,
    };

    return { college };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "College not found — SVIT Group" }, { name: "robots", content: "noindex" }] };
    }
    const { college } = loaderData;
    const title = `${college.name} (${college.shortCode}) — SVIT Group`;
    const description = `${college.shortCode} — ${college.tagline}. ${college.hero.subhead}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollegePage,
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">College not found</h1>
      <p className="mt-3 text-muted-foreground">The college you're looking for doesn't exist.</p>
    </div>
  ),
});

function CollegePage() {
  const { college } = Route.useLoaderData();
  return <CollegeLandingPage college={college} />;
}
