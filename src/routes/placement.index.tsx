import { createFileRoute } from "@tanstack/react-router";
import { PlacementPage } from "@/components/site/PlacementPage";
import { getAllPlacementContent } from "@/lib/placement.functions";

interface SearchParams {
  division?: string;
}

export const Route = createFileRoute("/placement/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    division: (search.division as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Training & Placement Cell — SVIT Group of Institutions" },
      {
        name: "description",
        content:
          "Placement outcomes, 200+ recruiters, year-on-year trends, and student achievements across SVIT engineering, architecture, computer applications, and nursing.",
      },
    ],
  }),
  loader: () => ({ data: getAllPlacementContent() }),
  component: PlacementIndexComponent,
});

function PlacementIndexComponent() {
  const { data } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSelectDivision = (slug: string) => {
    if (slug === "overview") {
      navigate({ to: "/placement", search: {} });
    } else {
      navigate({ to: "/placement", search: { division: slug } });
    }
  };

  return (
    <PlacementPage
      data={data}
      activeDivisionSlug={search.division || "overview"}
      onSelectDivision={handleSelectDivision}
    />
  );
}
