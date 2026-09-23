"use client";

import { useState } from "react";
import type { EntryCardData } from "@/lib/entry";
import { EntryCard } from "./EntryCard";
import { EntryViewer } from "./EntryViewer";
import { Reveal } from "./Reveal";

/**
 * A plain grid of Entry Cards (no filter chips) that owns the one Entry
 * viewer for Cards with no Detail page but more to show. Used wherever a
 * fixed list of Entries (e.g. one club's events) doesn't need EventsBrowser's
 * category filtering.
 */
export function EntryEventsGrid({ entries }: { entries: EntryCardData[] }) {
  const [viewing, setViewing] = useState<EntryCardData | null>(null);

  return (
    <>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry, i) => (
          <Reveal key={entry.id} delay={Math.min(i, 8) * 0.03}>
            <EntryCard entry={entry} onOpenViewer={setViewing} />
          </Reveal>
        ))}
      </div>
      <EntryViewer entry={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
