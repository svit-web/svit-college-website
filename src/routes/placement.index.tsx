import { createFileRoute } from "@tanstack/react-router";
import { PlacementPage } from "@/components/site/PlacementPage";
import { getPlacementContent } from "@/lib/placement.functions";

function PlacementSkeleton() {
  return (
    <>
      <div className="relative overflow-hidden bg-navy py-20 md:py-28">
        <div className="container-page">
          <div className="h-3 w-28 rounded bg-white/20 animate-pulse mb-4" />
          <div className="h-12 w-80 rounded bg-white/20 animate-pulse" />
          <div className="mt-4 h-4 w-96 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <section className="container-page py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-border bg-white p-6 animate-pulse">
              <div className="h-8 w-24 rounded bg-navy/8" />
              <div className="mt-3 h-4 w-32 rounded bg-navy/8" />
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-white p-4 animate-pulse">
              <div className="h-8 w-16 rounded bg-navy/8" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

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
  pendingComponent: PlacementSkeleton,
  component: PlacementIndexComponent,
});

function PlacementIndexComponent() {
  const { data } = Route.useLoaderData();
  return <PlacementPage data={data} />;
}
