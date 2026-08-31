import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { PillTabs } from "@/components/site-next/PillTabs";
import { getAllEvents, getEventBySlug } from "@/lib/events.functions";

async function loadEvent(slug: string) {
  const [item, allEvents] = await Promise.all([getEventBySlug(slug), getAllEvents()]);
  if (!item) return null;

  const transformedItem = {
    slug: item.slug,
    title: item.title,
    subtitle: item.subtitle ?? "",
    accent: item.accent_color ?? item.tag ?? "Event",
    description: item.description ?? "",
    highlights: item.metadata?.highlights ?? [],
    image: item.featured_image_url ?? null,
  };
  return { item: transformedItem, allEvents };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadEvent(slug);
  if (!result) return { title: "Event — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.item.title} — Events — SVIT Vasad`,
    description: result.item.description.slice(0, 155),
  };
}

export default async function EventLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadEvent(slug);
  if (!result) notFound();

  const { item, allEvents } = result;

  return (
    <div>
      <PillTabs
        ariaLabel="Events"
        items={allEvents.map((c) => ({
          label: c.title.split("—")[0].trim(),
          to: `/campus-life/events/${c.slug}`,
        }))}
      />
      <CampusLeafPage item={item} />
    </div>
  );
}
