import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { getFacilityBySlug } from "@/lib/facilities.functions";

export const Route = createFileRoute("/campus-life/facilities/$")({
  loader: async ({ params }) => {
    // Extract slug from splat (handles both /academic/slug and /co-curriculum/slug)
    const parts = (params._splat ?? "").split('/');
    const slug = parts[parts.length - 1]; // Get last part as slug

    const facility = await getFacilityBySlug({ data: slug });
    if (!facility) throw notFound();

    // Transform to match CampusLeafPage interface
    const item = {
      slug: facility.slug,
      title: facility.name,
      subtitle: facility.metadata?.subtitle || "",
      accent: facility.metadata?.accent || "Facility",
      description: facility.metadata?.description || "",
      highlights: Array.isArray(facility.metadata?.highlights) ? facility.metadata.highlights : [],
      image: null,
    };

    return { item };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.item.title} — Facilities — SVIT Vasad` },
            { name: "description", content: loaderData.item.description.slice(0, 155) },
          ],
        }
      : { meta: [{ title: "Facility — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: FacilityLeaf,
  notFoundComponent: FacilityNotFound,
});

function FacilityLeaf() {
  const { item } = Route.useLoaderData();
  return <CampusLeafPage item={item} />;
}

function FacilityNotFound() {
  return (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy">Facility not available</h2>
      <p className="mt-2 text-sm text-muted-foreground">The facility you are looking for does not exist yet.</p>
    </div>
  );
}
