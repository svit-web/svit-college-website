"use client";

import { useState } from "react";
import type { EntryCardData } from "@/lib/entry";
import { EntryCard } from "./EntryCard";
import { EntryViewer } from "./EntryViewer";
import { Reveal } from "./Reveal";

/**
 * A grid of achievement Cards that owns the one Entry viewer for the grid.
 * Cards with a Detail page link out (`detailHref`); the rest open the viewer
 * when they have more to show (album photos or a long description).
 */
export function AchievementsGrid({ entries }: { entries: EntryCardData[] }) {
  const [open, setOpen] = useState<EntryCardData | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {entries.map((entry, i) => (
          <Reveal key={entry.id} delay={Math.min(i, 8) * 0.04}>
            <EntryCard
              entry={entry}
              onOpenViewer={setOpen}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Reveal>
        ))}
      </div>
      <EntryViewer entry={open} onClose={() => setOpen(null)} />
    </>
  );
}
