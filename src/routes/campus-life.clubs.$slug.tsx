import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventsNewsSlider, type EventSlide } from "@/components/site/EventsNewsSlider";
import { getAllStudentClubs, getStudentClubBySlug, getEventsByClubId } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/$slug")({
  loader: async ({ params }) => {
    const [item, allClubs] = await Promise.all([
      getStudentClubBySlug({ data: params.slug }),
      getAllStudentClubs(),
    ]);

    if (!item) throw notFound();

    const events = await getEventsByClubId({ data: item.id });

    // Transform to match CampusLeafPage interface
    const transformedItem = {
      slug: item.slug,
      title: item.name,
      subtitle: item.metadata?.subtitle || "",
      accent: item.metadata?.accent || "Club",
      description: item.description || "",
      highlights: Array.isArray(item.metadata?.highlights) ? item.metadata.highlights : [],
      image: item.logo_url || null,
    };

    return { item: transformedItem, allClubs, events };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — Clubs — SVIT Vasad` }, { name: "description", content: (loaderData.item.description || "").slice(0, 155) }] }
      : { meta: [{ title: "Club — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: ClubLeaf,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Club not available</h2></div>,
});

function ClubLeaf() {
  const { item, allClubs, events } = Route.useLoaderData();

  const slides: EventSlide[] = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    tag: e.tag ?? "Event",
    date: new Date(e.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    imageUrl: e.imageUrl,
  }));

  return (
    <div>
      <PillTabs
        ariaLabel="Clubs"
        items={allClubs.map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />

      {slides.length > 0 && (
        <div className="mt-12">
          <SectionHeading eyebrow={item.title} title="Recent Events" variant="eyebrow" />
          <div className="mt-8">
            <EventsNewsSlider items={slides} />
          </div>
        </div>
      )}
    </div>
  );
}
