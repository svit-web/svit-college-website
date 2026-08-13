import type { Metadata } from "next";
import Link from "next/link";
import { CampusLeafPage } from "@/components/site-next/CampusLeafPage";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { EventsNewsSlider, type EventSlide } from "@/components/site-next/EventsNewsSlider";
import { getStudentClubBySlug, getClubEvents } from "@/lib/clubs.functions";

async function loadClub(slug: string) {
  const item = await getStudentClubBySlug(slug);
  if (!item) return null;
  const { events, total: eventsTotal } = await getClubEvents(item.id);
  return { item, events, eventsTotal };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadClub(slug);
  if (!result?.item) return { title: "Club — SVIT Vasad", robots: { index: false } };
  return {
    title: `${result.item.name} — Clubs — SVIT Vasad`,
    description: (result.item.description || "").slice(0, 155),
  };
}

export default async function ClubLeaf({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadClub(slug);
  if (!result) return null;

  const { item, events, eventsTotal } = result;

  const transformedItem = {
    slug: item.slug,
    title: item.name,
    subtitle: item.subtitle || "",
    accent: item.accent_color || "Club",
    description: item.description || "",
    highlights: Array.isArray((item.metadata as any)?.highlights) ? (item.metadata as any).highlights : [],
    image: item.logo_url || null,
  };

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
                href={`/campus-life/clubs/${item.slug}/events`}
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
