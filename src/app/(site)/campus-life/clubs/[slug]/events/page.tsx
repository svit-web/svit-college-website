import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { EntryEventsGrid } from "@/components/site-next/EntryEventsGrid";
import { getStudentClubBySlug, getAllClubEvents } from "@/lib/clubs.functions";
import { getEntryAlbums } from "@/lib/gallery.functions";
import type { EntryCardData } from "@/lib/entry";

async function loadClubEvents(slug: string) {
  const club = await getStudentClubBySlug(slug);
  if (!club) return null;
  const events = await getAllClubEvents(club.id);
  const albums = await getEntryAlbums(events.map((e) => e.albumId));
  return { club, events, albums };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadClubEvents(slug);
  if (!result) return { title: "Club Events — SVIT Vasad", robots: { index: false } };
  return { title: `${result.club.name} — Events — SVIT Vasad` };
}

export default async function ClubEventsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadClubEvents(slug);
  if (!result) notFound();

  const { club, events, albums } = result;

  const entries: EntryCardData[] = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    subtitle: new Date(e.eventDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    description: e.description,
    cardPhotoUrl: e.imageUrl,
    hasDetailPage: e.hasDetailPage,
    detailHref: e.hasDetailPage ? `/campus-life/events/${e.slug}` : null,
    album: e.albumId ? albums.get(e.albumId) ?? null : null,
  }));

  return (
    <div>
      <Link
        href={`/campus-life/clubs/${club.slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-crimson hover:text-navy"
      >
        ← Back to {club.name}
      </Link>
      <SectionHeading eyebrow={club.name} title="All Events" />

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No events yet — check back soon.</p>
      ) : (
        <EntryEventsGrid entries={entries} />
      )}
    </div>
  );
}
