"use client";

import { useMemo, useState } from "react";
import type { EntryCardData } from "@/lib/entry";
import { cn } from "@/lib/utils";
import { EntryCard } from "./EntryCard";
import { EntryViewer } from "./EntryViewer";
import { Reveal } from "./Reveal";

export type EventCategory = "institute" | "college" | "department" | "club";

export type EventBrowserItem = {
  entry: EntryCardData;
  /** Eyebrow shown on the Card (e.g. "12 Mar 2026 · Workshop"). */
  eyebrow: string;
  /** Every chip this Event matches — a club event also matches its scope's chip. */
  categories: EventCategory[];
};

const CHIPS: Array<{ key: "all" | EventCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "institute", label: "Institute" },
  { key: "college", label: "College" },
  { key: "department", label: "Department" },
  { key: "club", label: "Club" },
];

/**
 * The /campus-life/events grid: every published Event in one list with
 * client-side filter chips (the dataset is small, so no query params). Owns
 * the one Entry viewer for Cards that have no Detail page but more to show.
 */
export function EventsBrowser({ items }: { items: EventBrowserItem[] }) {
  const [filter, setFilter] = useState<"all" | EventCategory>("all");
  const [viewing, setViewing] = useState<EntryCardData | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const it of items) for (const cat of it.categories) c[cat] = (c[cat] ?? 0) + 1;
    return c;
  }, [items]);

  // Hide chips that would show nothing (e.g. College while no college-scoped
  // events exist); "All" always shows.
  const chips = CHIPS.filter((chip) => chip.key === "all" || (counts[chip.key] ?? 0) > 0);
  const visible = filter === "all" ? items : items.filter((it) => it.categories.includes(filter));

  return (
    <div>
      {chips.length > 2 && (
        <div role="group" aria-label="Filter events" className="mt-6 flex flex-wrap gap-2">
          {chips.map((chip) => {
            const active = filter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(chip.key)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-[0.84rem] font-semibold transition-colors",
                  active
                    ? "border-ink bg-ink text-cream"
                    : "border-line-strong text-ink hover:border-ink",
                )}
              >
                {chip.label}
                <span className={cn("ml-1.5", active ? "text-cream/60" : "text-ink-mute")}>
                  {counts[chip.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No events yet — check back soon.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((it, i) => (
            <Reveal key={it.entry.id} delay={Math.min(i, 8) * 0.03}>
              <EntryCard entry={it.entry} eyebrow={it.eyebrow} onOpenViewer={setViewing} />
            </Reveal>
          ))}
        </div>
      )}

      <EntryViewer entry={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
