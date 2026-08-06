import { createFileRoute, Link } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { SectionHeading } from "@/components/site/SectionHeading";
import { EventsNewsSlider, type EventSlide } from "@/components/site/EventsNewsSlider";
import { getStudentClubBySlug, getClubEvents } from "@/lib/clubs.functions";

export const Route = createFileRoute("/campus-life/clubs/$slug/")({
  loader: async ({ params }) => {
    const item = await getStudentClubBySlug({ data: params.slug });
    if (!item) return { item: null, events: [], eventsTotal: 0 };

    const { events, total: eventsTotal } = await getClubEvents({ data: item.id });

    return { item, events, eventsTotal };
  },
  head: ({ loaderData }) =>
    loaderData?.item
      ? { meta: [{ title: `${loaderData.item.name} — Clubs — SVIT Vasad` }, { name: "description", content: (loaderData.item.description || "").slice(0, 155) }] }
      : { meta: [{ title: "Club — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: ClubLeaf,
});

function ClubLeaf() {
  const { item, events, eventsTotal } = Route.useLoaderData();

  if (!item) return null;

  const transformedItem = {
    slug: item.slug,
    title: item.name,
    subtitle: item.subtitle || "",
    accent: item.accent_color || "Club",
    description: item.description || "",
    highlights: Array.isArray(item.metadata?.highlights) ? item.metadata.highlights : [],
    image: item.logo_url || null,
  };

  // Club events are self-contained (no shared detail page to link to) —
  // slug: null renders these slides as plain, non-clickable cards.
  const slides: EventSlide[] = events.map((e) => ({
    id: e.id,
    slug: null,
    title: e.title,
    tag: "Event",
    date: new Date(e.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    imageUrl: e.imageUrl,
  }));

  return (
    <div>
      <CampusLeafPage item={transformedItem} />

      {slides.length > 0 && (
        <div className="mt-12">
          <SectionHeading eyebrow={transformedItem.title} title="Recent Events" variant="eyebrow" />
          <div className="mt-8">
            <EventsNewsSlider items={slides} />
          </div>
          {eventsTotal > slides.length && (
            <div className="mt-6 text-center">
              <Link
                to="/campus-life/clubs/$slug/events"
                params={{ slug: item.slug }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-navy/15 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy transition-all hover:border-gold"
              >
                View more events →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
