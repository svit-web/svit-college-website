import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getStudentClubBySlug, getAllClubEvents } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/$slug/events")({
  loader: async ({ params }) => {
    const club = await getStudentClubBySlug({ data: params.slug });
    if (!club) throw notFound();

    const events = await getAllClubEvents({ data: club.id });

    return { club, events };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.club.name} — Events — SVIT Vasad` }] }
      : { meta: [{ title: "Club Events — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: ClubEventsPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy">Club not available</h2>
    </div>
  ),
});

function ClubEventsPage() {
  const { club, events } = Route.useLoaderData();

  return (
    <div>
      <Link
        to="/campus-life/clubs/$slug"
        params={{ slug: club.slug }}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson hover:text-navy"
      >
        ← Back to {club.name}
      </Link>
      <SectionHeading eyebrow={club.name} title="All Events" />

      {events.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No events yet — check back soon.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => (
            <Reveal key={e.id} delay={i * 0.03}>
              <div className="card-lift h-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold">
                {e.imageUrl && (
                  <img src={e.imageUrl} alt={e.title} className="h-40 w-full object-cover" />
                )}
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">
                    {new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <h4 className="mt-1 font-display font-bold text-navy">{e.title}</h4>
                  {e.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.description}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
