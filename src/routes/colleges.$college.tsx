import { createFileRoute, notFound } from "@tanstack/react-router";
import { CollegeLandingPage } from "@/components/site/CollegeLandingPage";
import { getCollegeBySlug, getDepartmentsByCollegeSlug } from "@/lib/colleges.functions";
import { getGlobalHomepageItems, getRecruiterLogos } from "@/lib/homepage.functions";

export const Route = createFileRoute("/colleges/$college")({
  loader: async ({ params }) => {
    const [dbCollege, departments, items, recruiters] = await Promise.all([
      getCollegeBySlug({ data: params.college }),
      getDepartmentsByCollegeSlug({ data: params.college }),
      getGlobalHomepageItems(),
      getRecruiterLogos(),
    ]);
    if (!dbCollege) throw notFound();

    const stats = items
      .filter((i) => i.item_type === "stat")
      .map((s) => ({ value: s.title, label: s.subtitle ?? "" }));

    const whyChoose = items
      .filter((i) => i.item_type === "why_choose")
      .map((w) => ({ title: w.title, desc: w.body ?? "", icon: w.icon_name ?? "BadgeCheck" }));

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
      },
      stats: stats.length > 0 ? stats : null,
      whyChoose: whyChoose.length > 0 ? whyChoose : null,
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
