"use client";

import { useState } from "react";
import { MouCard } from "@/components/site-next/MouCard";
import type { MOU } from "@/lib/mous.functions";
import { cn } from "@/lib/utils";

const INSTITUTE_WIDE = "Institute-wide";

export function mouDepartmentLabel(mou: MOU) {
  return mou.department?.name ?? mou.department_name ?? INSTITUTE_WIDE;
}

/** Every MoU with its department named, filterable by department. */
export function MouBrowser({ mous }: { mous: MOU[] }) {
  const [filter, setFilter] = useState("all");

  const counts = new Map<string, number>();
  for (const mou of mous) {
    const label = mouDepartmentLabel(mou);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const chips = [
    { key: "all", label: "All", count: mous.length },
    ...Array.from(counts, ([label, count]) => ({ key: label, label, count })).sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
  ];
  const visible = filter === "all" ? mous : mous.filter((m) => mouDepartmentLabel(m) === filter);

  return (
    <div>
      {chips.length > 2 && (
        <div role="group" aria-label="Filter MoUs by department" className="flex flex-wrap gap-2">
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
                    ? "border-ink bg-ink text-paper"
                    : "border-line-strong text-ink hover:border-ink",
                )}
              >
                {chip.label}
                <span className={cn("ml-1.5", active ? "text-paper/60" : "text-ink-mute")}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map((mou, i) => (
          <MouCard
            key={mou.id}
            mou={mou}
            department={mouDepartmentLabel(mou)}
            delay={Math.min(i, 8) * 0.03}
          />
        ))}
      </div>
    </div>
  );
}
