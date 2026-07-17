import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { resolveFacilityLeaf } from "@/data/campus-rfe";

export const Route = createFileRoute("/campus-life/facilities/$")({
  loader: ({ params }) => {
    const item = resolveFacilityLeaf(params._splat ?? "");
    if (!item) throw notFound();
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
