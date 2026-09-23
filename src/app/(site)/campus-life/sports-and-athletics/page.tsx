import type { Metadata } from "next";
import { getSports } from "@/lib/sports.functions";
import { getEntryAlbum } from "@/lib/gallery.functions";
import type { EntryAlbum } from "@/lib/entry";
import { SportsSection } from "@/components/site-next/SportsSection";

export const metadata: Metadata = {
  title: "Sports & Athletics — Campus Life — SVIT Vasad",
  description: "Sports disciplines, grounds and courts at SVIT Vasad.",
};

export default async function SportsAndAthleticsPage() {
  const sports = await getSports().catch(() => []);

  // Entry albums (extra photos) for the sports that have one; a failed album
  // load just leaves that Card without a viewer gallery.
  const albumEntries = await Promise.all(
    sports
      .filter((s) => s.album_id)
      .map(async (s) => [s.id, await getEntryAlbum(s.album_id).catch(() => null)] as const),
  );
  const albums: Record<string, EntryAlbum> = {};
  for (const [id, album] of albumEntries) if (album) albums[id] = album;

  // Sports achievements now live in the main `achievements` table (category
  // 'sports') and are shown by the Achievements section, not here.
  return <SportsSection sports={sports} albums={albums} variant="embedded" />;
}
