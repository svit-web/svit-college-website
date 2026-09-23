import Image from "next/image";
import type { ReactNode } from "react";
import type { EntryPhoto } from "@/lib/entry";
import { EntryAlbumSlideshow } from "./EntryAlbumSlideshow";
import { EntryCardPlaceholder } from "./EntryCard";
import { PlainText } from "./PlainText";

export type DetailPageEntry = {
  title: string;
  subtitle?: string | null;
  /** Eyebrow text above the title. */
  accent?: string | null;
  description?: string | null;
  /** Single-image fallback when the Entry has no album photos. */
  cardPhotoUrl?: string | null;
  album?: { media: EntryPhoto[] } | null;
  /**
   * Last-resort image (e.g. a club's logo) shown whole and centred on a plain
   * background — never cropped — when there's neither an album nor a Card photo.
   */
  fallbackLogoUrl?: string | null;
};

/**
 * The one Detail page layout for every Entry type (successor to
 * CampusLeafPage): album slideshow (or Card photo, or a centred
 * `fallbackLogoUrl`, or the branded placeholder), heading, full plain-text description, then a slot for the
 * type-specific facts the caller renders.
 */
export function DetailPageLayout({
  entry,
  children,
}: {
  entry: DetailPageEntry;
  children?: ReactNode;
}) {
  const photos = entry.album?.media ?? [];

  return (
    <div className="space-y-8">
      {photos.length > 0 ? (
        <EntryAlbumSlideshow photos={photos} title={entry.title} />
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-navy/15 bg-navy">
          {entry.cardPhotoUrl ? (
            <Image
              src={entry.cardPhotoUrl}
              alt={entry.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : entry.fallbackLogoUrl ? (
            <div className="absolute inset-0 bg-white">
              <Image
                src={entry.fallbackLogoUrl}
                alt={`${entry.title} logo`}
                fill
                priority
                sizes="(max-width: 768px) 60vw, 400px"
                className="object-contain p-10 md:p-16"
              />
            </div>
          ) : (
            <EntryCardPlaceholder size="lg" />
          )}
        </div>
      )}

      <div>
        {entry.accent && (
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">
            {entry.accent}
          </div>
        )}
        <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-navy">
          {entry.title}
        </h2>
        {entry.subtitle && (
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {entry.subtitle}
          </p>
        )}
      </div>

      <PlainText text={entry.description} />

      {children}
    </div>
  );
}
