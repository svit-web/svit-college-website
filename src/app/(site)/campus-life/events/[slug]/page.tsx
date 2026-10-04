import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { getEventBySlug } from "@/lib/events.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";
import { eventTypeLabel, formatEventDates } from "@/lib/event-types";
import { eventJsonLd, metaDescription, parseRobots, siteOpenGraph } from "@/lib/seo";
import { JsonLd } from "@/components/site-next/JsonLd";

// Per-request dedupe between generateMetadata and the page.
const loadEvent = cache(async (slug: string) => {
  const event = await getEventBySlug(slug);
  if (!event || !event.has_detail_page) return null;
  const album = await getEntryAlbum(event.album_id);
  return { event, album };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadEvent(slug);
  if (!result) return { title: "Event — SVIT Vasad", robots: { index: false } };
  const { event } = result;
  const seo = event.seo;
  const description = seo?.meta_description || metaDescription(event.description);
  const image = seo?.og_image_url || event.card_photo_url;
  const base = await siteOpenGraph();
  return {
    title: seo?.meta_title || `${event.title} — Events — SVIT Vasad`,
    description,
    alternates: { canonical: seo?.canonical_url || `/campus-life/events/${event.slug}` },
    robots: parseRobots(seo?.robots_directives),
    openGraph: {
      ...base,
      title: seo?.og_title || seo?.meta_title || event.title,
      description: seo?.og_description || description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function EventLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadEvent(slug);
  if (!result) notFound();

  const { event, album } = result;
  const typeLabel = eventTypeLabel(event.event_type);
  const highlights = event.metadata?.highlights ?? [];

  return (
    <div>
      {event.start_date && (
        <JsonLd
          data={eventJsonLd({
            title: event.title,
            url: `/campus-life/events/${event.slug}`,
            startDate: event.start_date,
            endDate: event.end_date,
            description: metaDescription(event.description),
            image: event.card_photo_url,
            location: event.location,
          })}
        />
      )}
      <Link
        href="/campus-life/events"
        className="mb-6 inline-flex items-center gap-2 py-1.5 text-sm font-semibold text-ink-soft hover:text-crimson"
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
        <div className="grid gap-5 border border-line bg-paper-deep/60 p-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-crimson" />
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
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
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
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
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  Registration
                </div>
                <a
                  href={event.registration_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block py-1 font-semibold text-crimson hover:underline"
                >
                  Register now
                </a>
              </div>
            </div>
          )}

          {event.club && (
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Organised by
              </div>
              {event.club.has_detail_page ? (
                <Link
                  href={`/campus-life/clubs/${event.club.slug}`}
                  className="inline-block py-1 font-semibold text-crimson hover:underline"
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
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                Department
              </div>
              <span className="font-semibold text-navy">{event.department.name}</span>
            </div>
          )}
        </div>

        {highlights.length > 0 && (
          <div>
            <SectionHeading eyebrow="Highlights" title="What makes it special" variant="eyebrow" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.04}>
                  <div className="h-full border border-line bg-surface p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-deep text-xs font-bold text-navy">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-display font-medium text-navy">{h.title}</div>
                        <p className="mt-1 text-sm text-ink-soft">{h.description}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </DetailPageLayout>
    </div>
  );
}
