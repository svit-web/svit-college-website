import { createFileRoute, notFound } from "@tanstack/react-router";
import { CampusLeafPage } from "@/components/site/CampusLeafPage";
import { PillTabs } from "@/components/site/PillTabs";
import { eventDetails, eventMap } from "@/data/campus-rfe";

export const Route = createFileRoute("/campus-life/events/$slug")({
  loader: ({ params }) => {
    const item = eventMap[params.slug];
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) =>
    loaderData
      ? { meta: [{ title: `${loaderData.item.title} — Events — SVIT Vasad` }, { name: "description", content: loaderData.item.description.slice(0, 155) }] }
      : { meta: [{ title: "Event — SVIT Vasad" }, { name: "robots", content: "noindex" }] },
  component: EventLeaf,
  notFoundComponent: () => <div className="rounded-2xl border-2 border-navy/15 bg-white p-10 text-center"><div className="text-xs font-bold uppercase tracking-widest text-crimson">Not found</div><h2 className="mt-2 font-display text-2xl font-bold text-navy">Event not available</h2></div>,
});

function EventLeaf() {
  const { item } = Route.useLoaderData();
  return (
    <div>
      <PillTabs
        ariaLabel="Events"
        items={eventDetails.map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
