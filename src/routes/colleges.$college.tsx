import { createFileRoute, notFound } from "@tanstack/react-router";
import { CollegeLandingPage } from "@/components/site/CollegeLandingPage";
import { collegeMap, type CollegeSlug } from "@/data/colleges";

export const Route = createFileRoute("/colleges/$college")({
  loader: ({ params }) => {
    const college = collegeMap[params.college as CollegeSlug];
    if (!college) throw notFound();
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
