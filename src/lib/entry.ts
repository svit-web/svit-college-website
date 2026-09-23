// The shared Entry shape (see CONTEXT.md: Entry, Card, Card photo, Entry album,
// Entry viewer, Detail page). Every content type — facility, event, news post,
// achievement, club, sport, centre — maps its own Supabase row into this shape
// so one Card / Entry viewer / Detail page layout can render all of them.
// Routes are the caller's concern: this module never builds a URL.

export type EntryPhoto = {
  id: string;
  url: string;
  caption: string | null;
};

export type EntryAlbum = {
  id: string;
  media: EntryPhoto[];
};

export type EntryCardData = {
  id: string;
  slug: string;
  title: string;
  /** Small eyebrow/category text shown above the title. */
  subtitle?: string | null;
  /** Plain text (no markup), may be long. */
  description?: string | null;
  cardPhotoUrl?: string | null;
  hasDetailPage: boolean;
  /** Only meaningful when `hasDetailPage`; computed per type by the caller. */
  detailHref?: string | null;
  album?: EntryAlbum | null;
};

/**
 * Descriptions longer than this are assumed to be clamped on the Card
 * (`line-clamp-3` at card width), so the Card opens the Entry viewer to show
 * the rest. A heuristic: clamping can't be measured during server rendering.
 */
export const CARD_DESCRIPTION_CLAMP_CHARS = 180;

export function entryHasAlbumPhotos(entry: Pick<EntryCardData, "album">): boolean {
  return (entry.album?.media.length ?? 0) > 0;
}

/** True when an Entry without a Detail page still has more to show than its Card. */
export function entryHasMoreToShow(entry: Pick<EntryCardData, "album" | "description">): boolean {
  return (
    entryHasAlbumPhotos(entry) ||
    (entry.description?.trim().length ?? 0) > CARD_DESCRIPTION_CLAMP_CHARS
  );
}
