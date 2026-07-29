import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { PillTabs } from "@/components/site/PillTabs";
import { getAllStudentClubs, getStudentClubBySlug } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/$slug")({
  loader: async ({ params }) => {
    const [item, allClubs] = await Promise.all([
      getStudentClubBySlug({ data: params.slug }),
      getAllStudentClubs(),
    ]);

    if (!item) throw notFound();

    return { allClubs };
  },
  component: ClubLayout,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Club not available</h2></div>,
});

function ClubLayout() {
  const { allClubs } = Route.useLoaderData();

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={allClubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <Outlet />
    </div>
  );
}
