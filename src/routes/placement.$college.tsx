import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PlacementPage } from "@/components/site/PlacementPage";
import { getAllPlacementContent } from "@/lib/placement.functions";

export const Route = createFileRoute("/placement/$college")({
  head: ({ params }) => {
    const slug = params.college.toLowerCase();
    const title = `${slug.toUpperCase()} Placements — SVIT Vasad`;
    const desc = `Placement outcomes, recruiters and Training & Placement Cell at ${slug.toUpperCase()}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: () => ({ data: getAllPlacementContent() }),
  component: PlacementCollegeRouteComponent,
});

function PlacementCollegeRouteComponent() {
  const { data } = Route.useLoaderData();
  const { college } = Route.useParams();
  const navigate = useNavigate();

  const handleSelectDivision = (slug: string) => {
    if (slug === "overview") {
      navigate({ to: "/placement" });
    } else {
      navigate({ to: "/placement/$college", params: { college: slug } });
    }
  };

  return (
    <PlacementPage
      data={data}
      activeDivisionSlug={college}
      onSelectDivision={handleSelectDivision}
    />
  );
}
