"use client";

// Client component: the sports grid owns the Entry viewer state (CONTEXT.md:
// Entry viewer), so one viewer serves every sport Card on the page.
import { useState } from "react";
import { eyebrow, sectionH2, sectionSpacing } from "./site-styles";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { EntryCard } from "./EntryCard";
import { EntryViewer } from "./EntryViewer";
import type { EntryAlbum, EntryCardData } from "@/lib/entry";
import type { Sport } from "@/lib/sports.functions";

const CATEGORY_LABEL: Record<string, string> = {
  outdoor: "Outdoor",
  indoor: "Indoor",
  aquatic: "Aquatic",
  combat: "Combat",
};

function sportAnchor(sport: Sport): string {
  return sport.slug ?? sport.name.toLowerCase().replace(/\s+/g, "-");
}

/** Eyebrow: category, plus the squad size when one is set. */
function sportEyebrow(sport: Sport): string {
  const category = CATEGORY_LABEL[sport.category] ?? sport.category;
  return sport.players_count ? `${category} · ${sport.players_count} players` : category;
}

/**
 * The Entry description: the sport's own text, then (for sports merged in from
 * the old facilities list) the venue and highlights, then the coach. Plain
 * text; the Card clamps it and the Entry viewer shows the whole thing.
 */
function sportDescription(sport: Sport): string {
  const parts: string[] = [];
  if (sport.description?.trim()) parts.push(sport.description.trim());

  const { venue_name, highlights } = sport.metadata ?? {};
  if (venue_name) parts.push(`Venue: ${venue_name}`);
  const highlightLines = (Array.isArray(highlights) ? highlights : [])
    .filter((h) => h?.title)
    .map((h) => (h.description ? `${h.title}: ${h.description}` : h.title));
  if (highlightLines.length) parts.push(highlightLines.join("\n"));

  if (sport.coach_name) parts.push(`Coach: ${sport.coach_name}`);
  return parts.join("\n\n");
}

function toEntry(sport: Sport, album: EntryAlbum | undefined): EntryCardData {
  return {
    id: sport.id,
    slug: sport.slug,
    title: sport.name,
    subtitle: sport.metadata?.subtitle ?? null,
    description: sportDescription(sport) || null,
    cardPhotoUrl: sport.card_photo_url,
    hasDetailPage: sport.has_detail_page,
    // No sport Detail page route exists yet, so Cards never link out; a sport
    // with more to show opens the Entry viewer instead.
    detailHref: null,
    album: album ?? null,
  };
}

function SportsStats({
  sports,
  outdoorCount,
  indoorCount,
}: {
  sports: Sport[];
  outdoorCount: number;
  indoorCount: number;
}) {
  return (
    <div className="grid grid-cols-3 divide-x divide-line border-y border-line">
      {[
        { value: `${sports.length}+`, label: "Sports Offered" },
        { value: `${outdoorCount}`, label: "Outdoor Disciplines" },
        { value: `${indoorCount}`, label: "Indoor Disciplines" },
      ].map((s) => (
        <div key={s.label} className="px-2 py-6 text-center">
          <div className="font-display text-3xl font-medium text-navy md:text-4xl">{s.value}</div>
          <div className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SportsGrid({ sports, albums }: { sports: Sport[]; albums: Record<string, EntryAlbum> }) {
  const [open, setOpen] = useState<EntryCardData | null>(null);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sports.map((sport, i) => (
          <Reveal key={sport.id} delay={i * 0.04}>
            {/* Anchor target for the Campus mega-panel's per-sport links. */}
            <div id={sportAnchor(sport)} className="h-full scroll-mt-24">
              <EntryCard
                entry={toEntry(sport, albums[sport.id])}
                eyebrow={sportEyebrow(sport)}
                onOpenViewer={setOpen}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              />
            </div>
          </Reveal>
        ))}
      </div>
      <EntryViewer entry={open} onClose={() => setOpen(null)} />
    </>
  );
}

/**
 * "Sports & Athletics" content, sourced from the `sports` table (which also
 * holds the courts/grounds formerly listed under facilities).
 * `variant="standalone"` (default) renders full-bleed colored bands for a bare
 * page; `variant="embedded"` renders plain stacked sections for use inside a
 * constrained layout like the Campus Life sidebar page.
 */
export function SportsSection({
  sports,
  albums = {},
  variant = "standalone",
}: {
  sports: Sport[];
  /** Entry albums keyed by sport id. */
  albums?: Record<string, EntryAlbum>;
  variant?: "standalone" | "embedded";
}) {
  const outdoorCount = sports.filter((s) => s.category === "outdoor").length;
  const indoorCount = sports.filter((s) => s.category === "indoor").length;

  if (variant === "embedded") {
    return (
      <div className="space-y-12">
        <section className="border border-line bg-paper-deep p-6 md:p-10">
          <div className={`mb-3 ${eyebrow}`}>Sports & Athletics</div>
          <h2 className={sectionH2}>Champions On and Off the Field</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft md:text-base">
            SVIT believes sports build character as much as academics. Our state-of-the-art
            grounds and courts have produced university, state, and national-level athletes.
          </p>
          <div className="mt-10">
            <SportsStats sports={sports} outdoorCount={outdoorCount} indoorCount={indoorCount} />
          </div>
        </section>

        {sports.length > 0 && (
          <section>
            <SectionHeading eyebrow="Our Sports" title="Disciplines We Offer" />
            <div className="mt-6">
              <SportsGrid sports={sports} albums={albums} />
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      <section className={`border-y border-line bg-paper-deep ${sectionSpacing}`}>
        <div className="container-page">
          <div>
            <div className={`mb-3 ${eyebrow}`}>Sports & Athletics</div>
            <h2 className={sectionH2}>Champions On and Off the Field</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">
              SVIT believes sports build character as much as academics. Our state-of-the-art
              grounds and courts have produced university, state, and national-level athletes.
            </p>
          </div>

          <div className="mt-12">
            <SportsStats sports={sports} outdoorCount={outdoorCount} indoorCount={indoorCount} />
          </div>
        </div>
      </section>

      {sports.length > 0 && (
        <section className={`container-page ${sectionSpacing}`}>
          <SectionHeading center eyebrow="Our Sports" title="Disciplines We Offer" />
          <div className="mt-12">
            <SportsGrid sports={sports} albums={albums} />
          </div>
        </section>
      )}
    </>
  );
}
