import Link from "next/link";
import type { LiveStats } from "@/lib/stats.functions";

export function PlacementMegaPanel({ liveStats }: { liveStats: LiveStats | null }) {
  return (
    <div className="grid gap-10 py-10 md:grid-cols-2">
      <div>
        <div className="mb-3 border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.14em] text-navy">
          Placement
        </div>
        <Link
          href="/placement"
          className="block py-1.5 text-[14.5px] text-ink/80 transition-colors hover:text-crimson"
        >
          Placement Overview
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6 border-l border-border pl-8">
        <div>
          <div className="font-display text-3xl font-bold text-crimson">
            {liveStats ? `${liveStats.recruitersCount}+` : "—"}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Recruiting Partners
          </div>
        </div>
        <div>
          <div className="font-display text-3xl font-bold text-crimson">
            {liveStats ? `${liveStats.placedStudentsCount}+` : "—"}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Students Placed
          </div>
        </div>
        <p className="col-span-2 text-sm text-muted-foreground">
          Our dedicated Training &amp; Placement Cell works with recruiters across engineering, IT,
          pharma and core sectors.
        </p>
      </div>
    </div>
  );
}
