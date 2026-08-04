import { createFileRoute } from "@tanstack/react-router";
import { PlacementPage } from "@/components/site/PlacementPage";
import { getPlacementContent } from "@/lib/placement.functions";

export const Route = createFileRoute("/placement/")({
  head: () => ({
    meta: [
      { title: "Training & Placement Cell — SVIT Group of Institutions" },
      {
        name: "description",
        content:
          "Placement outcomes, recruiting partners, year-on-year trends, and student achievements across SVIT engineering, architecture, computer applications, and nursing.",
      },
    ],
  }),
  loader: async () => ({ data: await getPlacementContent() }),
  component: PlacementIndexComponent,
});

function PlacementIndexComponent() {
  const { data } = Route.useLoaderData();
  return <PlacementPage data={data} />;
}
