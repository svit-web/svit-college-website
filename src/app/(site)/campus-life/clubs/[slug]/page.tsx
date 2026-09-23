import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPageLayout } from "@/components/site-next/DetailPageLayout";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { EventsNewsSlider, type EventSlide } from "@/components/site-next/EventsNewsSlider";
import { getStudentClubBySlug, getClubEvents } from "@/lib/clubs.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";

async function loadClub(slug: string) {
  const item = await getStudentClubBySlug(slug);
  if (!item || !item.has_detail_page) return null;
  const [{ events, total: eventsTotal }, album] = await Promise.all([
    getClubEvents(item.id),
    getEntryAlbum(item.album_id),
  ]);
  return { item, events, eventsTotal, album };
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

export default async function ClubLeaf({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadClub(slug);
  if (!result) notFound();

  const { item, events, eventsTotal, album } = result;

  const slides: EventSlide[] = events.map((e) => ({
    id: e.id,
    slug: e.hasDetailPage ? e.slug : null,
    title: e.title,
    tag: "Event",
    date: new Date(e.eventDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    imageUrl: e.imageUrl,
  }));

  return (
    <div>
      <DetailPageLayout
        entry={{
          title: item.name,
          subtitle: item.subtitle,
          accent: item.accent_color || "Club",
          description: item.description,
          cardPhotoUrl: item.card_photo_url,
          album,
          fallbackLogoUrl: item.logo_url,
        }}
      />

      {slides.length > 0 && (
        <div className="mt-12">
          <SectionHeading eyebrow={item.name} title="Recent Events" variant="eyebrow" />
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
