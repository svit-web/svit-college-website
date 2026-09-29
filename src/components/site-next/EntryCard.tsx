// Deliberately NOT a client component. Server parents render it as a link or a
// plain div; a client parent (which owns the Entry viewer state for a whole
// grid) imports it and passes `onOpenViewer`. Next 16 rejects function props
// crossing from a Server to a Client Component, so a server parent simply
// never passes `onOpenViewer` — and without it the card falls back to a div
// rather than rendering a dead button.
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
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
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-paper-deep">
      {/* The campus-life mosaic's "dots" texture. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(43,47,94,0.16) 1.1px, transparent 1.6px)",
          backgroundSize: "15px 15px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex items-center justify-center rounded-full border border-line-strong bg-paper text-navy/50 ${large ? "h-24 w-24" : "h-14 w-14"}`}
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

const SHELL = "flex h-full w-full flex-col overflow-hidden border border-line bg-surface text-left";
const INTERACTIVE =
  "group cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export function EntryCard({
  entry,
  eyebrow,
  accentColor,
  onOpenViewer,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: EntryCardProps) {
  const eyebrowText = eyebrow ?? entry.subtitle;

  // Always-visible affordance so tapping works without discovering a hover.
  const body = (action?: string): ReactNode => (
    <>
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-paper-deep">
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
      <div className="flex flex-1 flex-col p-5">
        {eyebrowText && (
          <div
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson"
            style={accentColor ? { color: accentColor } : undefined}
          >
            {eyebrowText}
          </div>
        )}
        <h4 className="mt-1.5 font-display text-lg font-medium leading-tight text-navy">
          {entry.title}
        </h4>
        {entry.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {entry.description}
          </p>
        )}
        {action && (
          <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-navy transition-colors group-hover:text-crimson">
            {action}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </>
  );

  if (entry.hasDetailPage && entry.detailHref) {
    return (
      <Link href={entry.detailHref} className={`${SHELL} ${INTERACTIVE}`}>
        {body("Read more")}
      </Link>
    );
  }

  if (onOpenViewer && entryHasMoreToShow(entry)) {
    // A button can't legally contain the heading/divs, so the whole card is
    // covered by a stretched button instead (same click target, valid HTML).
    return (
      <div
        className={`relative ${SHELL} ${INTERACTIVE} focus-within:ring-2 focus-within:ring-navy focus-within:ring-offset-2 focus-within:ring-offset-paper`}
      >
        {body("View")}
        <button
          type="button"
          onClick={() => onOpenViewer(entry)}
          aria-haspopup="dialog"
          aria-label={`View ${entry.title}`}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-none"
        />
      </div>
    );
  }

  return <div className={SHELL}>{body()}</div>;
}
