// Deliberately NOT a client component. Server parents render it as a link or a
// plain div; a client parent (which owns the Entry viewer state for a whole
// grid) imports it and passes `onOpenViewer`. Next 16 rejects function props
// crossing from a Server to a Client Component, so a server parent simply
// never passes `onOpenViewer` — and without it the card falls back to a div
// rather than rendering a dead button.
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import { entryHasMoreToShow, type EntryCardData } from "@/lib/entry";

/**
 * The one branded stand-in for a missing photo, used by every Card and Detail
 * page so a photo-less Entry never looks structurally different. Fills its
 * (relatively positioned) parent.
 */
export function EntryCardPlaceholder({ size = "sm" }: { size?: "sm" | "lg" }) {
  const large = size === "lg";
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-navy">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_50%),radial-gradient(circle_at_80%_80%,color-mix(in_oklab,var(--crimson)_20%,transparent),transparent_55%)]" />
      <div
        className={`absolute rounded-full bg-gold/20 blur-3xl ${large ? "-top-24 -right-24 h-72 w-72" : "-top-12 -right-12 h-36 w-36"}`}
      />
      <div
        className={`absolute rounded-full bg-crimson/20 blur-3xl ${large ? "-bottom-24 -left-24 h-72 w-72" : "-bottom-12 -left-12 h-36 w-36"}`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex items-center justify-center rounded-full border border-gold/30 bg-white/5 text-gold/70 ${large ? "h-24 w-24" : "h-14 w-14"}`}
        >
          <ImageIcon className={large ? "h-10 w-10" : "h-6 w-6"} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

type EntryCardProps = {
  entry: EntryCardData;
  /** Eyebrow text when it should differ from `entry.subtitle`. */
  eyebrow?: string | null;
  /** CSS color for the eyebrow; defaults to the crimson token. */
  accentColor?: string | null;
  /** Supplied by a client parent that owns the Entry viewer for its grid. */
  onOpenViewer?: (entry: EntryCardData) => void;
  /** Card photo `sizes` hint for next/image. */
  sizes?: string;
};

const SHELL =
  "flex h-full w-full flex-col overflow-hidden rounded-2xl border-2 border-navy/15 bg-white text-left";
const INTERACTIVE =
  "card-lift group cursor-pointer hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";

export function EntryCard({
  entry,
  eyebrow,
  accentColor,
  onOpenViewer,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: EntryCardProps) {
  const eyebrowText = eyebrow ?? entry.subtitle;

  const body: ReactNode = (
    <>
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-navy">
        {entry.cardPhotoUrl ? (
          <Image
            src={entry.cardPhotoUrl}
            alt={entry.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <EntryCardPlaceholder />
        )}
      </div>
      <div className="flex-1 p-5">
        {eyebrowText && (
          <div
            className="text-xs font-bold uppercase tracking-widest text-crimson"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {eyebrowText}
          </div>
        )}
        <h4 className="mt-1 font-display font-bold text-navy">{entry.title}</h4>
        {entry.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.description}</p>
        )}
      </div>
    </>
  );

  if (entry.hasDetailPage && entry.detailHref) {
    return (
      <Link href={entry.detailHref} className={`${SHELL} ${INTERACTIVE}`}>
        {body}
      </Link>
    );
  }

  if (onOpenViewer && entryHasMoreToShow(entry)) {
    // A button can't legally contain the heading/divs, so the whole card is
    // covered by a stretched button instead (same click target, valid HTML).
    return (
      <div
        className={`relative ${SHELL} ${INTERACTIVE} focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2`}
      >
        {body}
        <button
          type="button"
          onClick={() => onOpenViewer(entry)}
          aria-haspopup="dialog"
          aria-label={`View ${entry.title}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:outline-none"
        />
      </div>
    );
  }

  return <div className={SHELL}>{body}</div>;
}
