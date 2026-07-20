import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlacementPage, PlacementPageNotFound } from "@/components/site/PlacementPage";
import { placementPages, type PlacementSlug } from "@/data/placement";
import { useSupabasePlacementStats, useSupabaseRecruiters } from "@/hooks/useSupabaseData";

export const Route = createFileRoute("/placement/$college")({
  head: ({ params }) => {
    const key = params.college as PlacementSlug;
    const p = placementPages[key];
    const title = p ? `${p.shortCode} Placements — SVIT Vasad` : "Placements — SVIT Vasad";
    const desc = p
      ? `Placement outcomes, recruiters and Training & Placement Cell at ${p.collegeName}.`
      : "SVIT Vasad Placement.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const key = params.college as PlacementSlug;
    const content = placementPages[key];
    if (!content) throw notFound();
    return { content };
  },
  notFoundComponent: PlacementPageNotFound,
  errorComponent: PlacementPageNotFound,
  component: PlacementRouteComponent,
});

function PlacementRouteComponent() {
  const { content: loaderContent } = Route.useLoaderData();
  const { data: recruitersData } = useSupabaseRecruiters();
  const { data: statsData } = useSupabasePlacementStats();

  const content = {
    ...loaderContent,
    recruiters: recruitersData && recruitersData.length > 0 ? recruitersData : loaderContent.recruiters,
  };

  return <PlacementPage content={content} />;
}
