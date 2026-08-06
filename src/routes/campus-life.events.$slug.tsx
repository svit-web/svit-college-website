import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { getAllEvents, getEventBySlug } from "@/lib/events.functions";

export const Route = createFileRoute("/campus-life/events/$slug")({
  loader: async ({ params }) => {
    const [item, allEvents] = await Promise.all([
      getEventBySlug({ data: params.slug }),
      getAllEvents(),
    ]);
    if (!item) throw notFound();
    // Transform to match CampusLeafPage interface
    const transformedItem = {
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle ?? "",
      accent: item.accent_color ?? item.tag ?? "Event",
      description: item.description ?? "",
      highlights: Array.isArray(item.metadata?.highlights) ? item.metadata.highlights : [],
      image: item.featured_image_url ?? null,
    };
    return { item: transformedItem, allEvents };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — Events — SVIT Vasad` }, { name: "description", content: loaderData.item.description.slice(0, 155) }] }
      : { meta: [{ title: "Event — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: EventLeaf,
  notFoundComponent: () => (
    <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy">Event not available</h2>
    </div>
  ),
});

function EventLeaf() {
  const { item, allEvents } = Route.useLoaderData();
  return (
    <div>
      <PillTabs
        ariaLabel="Events"
        items={allEvents.map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
