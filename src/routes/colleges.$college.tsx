import { createFileRoute, notFound } from "@tanstack/react-router";
import { CollegeLandingPage } from "@/components/site/CollegeLandingPage";
import { collegeMap, type CollegeSlug } from "@/data/colleges";
import { useSupabaseColleges } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/colleges/$college")({
  loader: ({ params }) => {
    const key = params.college.toLowerCase();
    const college =
      collegeMap[key as CollegeSlug] ||
      Object.values(collegeMap).find((c) => c.id.toLowerCase() === key || c.shortCode.toLowerCase() === key) ||
      {
        id: key as any,
        name: key === "yoyo" ? "Yoyo College of Advanced Studies" : `${params.college.toUpperCase()} College`,
        shortCode: key.toUpperCase(),
        tagline: "Empowering innovation & future leaders",
        logo: "",
        route: `/colleges/${key}`,
        hero: {
          kicker: "SVIT Group",
          subhead: `Welcome to ${key === "yoyo" ? "Yoyo College of Advanced Studies" : params.college} — excellence in education, research and innovation.`,
        },
        stats: null,
        whyChoose: null,
        recruiters: null,
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
  const { college: loaderCollege } = Route.useLoaderData();
  const { data: colleges } = useSupabaseColleges();
  const dynamicCollege = colleges?.find((c) => c.id === loaderCollege.id);
  const college = dynamicCollege
    ? {
        ...loaderCollege,
        name: dynamicCollege.name,
        tagline: dynamicCollege.tagline || loaderCollege.tagline,
      }
    : loaderCollege;
  return <CollegeLandingPage college={college} />;
}
