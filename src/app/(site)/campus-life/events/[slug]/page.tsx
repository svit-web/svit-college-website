import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { getEventBySlug } from "@/lib/events.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";
import { eventTypeLabel, formatEventDates } from "@/lib/event-types";

async function loadEvent(slug: string) {
  const event = await getEventBySlug(slug);
  if (!event || !event.has_detail_page) return null;
  const album = await getEntryAlbum(event.album_id);
  return { event, album };
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
    title: `${result.event.title} — Events — SVIT Vasad`,
    description: result.event.description?.slice(0, 155),
  };
}

export default async function EventLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadEvent(slug);
  if (!result) notFound();

  const { event, album } = result;
  const typeLabel = eventTypeLabel(event.event_type);

  return (
    <div>
      <Link
        href="/campus-life/events"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <DetailPageLayout
        entry={{
          title: event.title,
          subtitle: event.subtitle,
          accent: typeLabel ?? event.accent_color ?? event.tag ?? "Event",
          description: event.description,
          cardPhotoUrl: event.card_photo_url,
          album,
        }}
      >
        <div className="grid gap-4 rounded-2xl border-2 border-navy/15 bg-white p-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Date
              </div>
              <div className="font-semibold text-navy">
                {formatEventDates(event.start_date, event.end_date)}
              </div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Location
                </div>
                <div className="font-semibold text-navy">
                  {event.map_url ? (
                    <a href={event.map_url} target="_blank" rel="noreferrer" className="hover:text-crimson">
                      {event.location}
                    </a>
                  ) : (
                    event.location
                  )}
                </div>
              </div>
            </div>
          )}

          {event.registration_link && (
            <div className="flex items-start gap-3">
              <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Registration
                </div>
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-crimson hover:underline"
                >
                  Register now
                </a>
              </div>
            </div>
          )}

          {event.club && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Organised by
              </div>
              {event.club.has_detail_page ? (
                <Link
                  href={`/campus-life/clubs/${event.club.slug}`}
                  className="font-semibold text-crimson hover:underline"
                >
                  {event.club.name}
                </Link>
              ) : (
                <span className="font-semibold text-navy">{event.club.name}</span>
              )}
            </div>
          )}

          {!event.club && event.department && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Department
              </div>
              <span className="font-semibold text-navy">{event.department.name}</span>
            </div>
          )}
        </div>
      </DetailPageLayout>
    </div>
  );
}
