import type { Metadata } from "next";
import { EventsBrowser, type EventBrowserItem, type EventCategory } from "@/components/site-next/EventsBrowser";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getAllEvents, type CampusEvent } from "@/lib/events.functions";
import { getEntryAlbums } from "@/lib/gallery.functions";
import { eventTypeLabel, formatEventDates } from "@/lib/event-types";
import type { EntryCardData } from "@/lib/entry";

export const metadata: Metadata = {
  title: "Events — SVIT Vasad",
  description: "TEDx, Prakarsh, Spandan, Malhar and other flagship events at SVIT Vasad.",
};

function categoriesFor(event: CampusEvent): EventCategory[] {
  const cats: EventCategory[] = [];
  if (event.club_id) cats.push("club");
  if (event.scope_type === "department") cats.push("department");
  if (event.scope_type === "college") cats.push("college");
  if (event.scope_type === "global" || event.scope_type === "trust" || event.scope_type === "institute") {
    cats.push("institute");
  }
  return cats.length > 0 ? cats : ["institute"];
}

function eyebrowFor(event: CampusEvent): string {
  const type = eventTypeLabel(event.event_type);
  const date = formatEventDates(event.start_date, event.end_date);
  return type ? `${date} · ${type}` : date;
}

export default async function EventsIndex() {
  const events = await getAllEvents().catch(() => []);
  const albums = await getEntryAlbums(events.map((e) => e.album_id));

  const items: EventBrowserItem[] = events.map((event) => {
    const entry: EntryCardData = {
      id: event.id,
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle ?? event.accent_color ?? event.tag ?? null,
      description: event.description,
      cardPhotoUrl: event.card_photo_url,
      hasDetailPage: event.has_detail_page,
      detailHref: event.has_detail_page ? `/campus-life/events/${event.slug}` : null,
      album: event.album_id ? albums.get(event.album_id) ?? null : null,
    };
    return { entry, eyebrow: eyebrowFor(event), categories: categoriesFor(event) };
  });

  return (
    <div>
      <SectionHeading eyebrow="Events" title="Signature moments on campus" />
      <EventsBrowser items={items} />
    </div>
  );
}
