"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import type { DeptActivity, DeptActivityType } from "@/lib/department-content.functions";
import { EntryCardPlaceholder } from "./EntryCard";

const TYPE_LABELS: Record<DeptActivityType, string> = {
  expert_session: "Expert Session",
  industrial_visit: "Industry Visit",
  seminar: "Seminar",
  workshop: "Workshop",
  sttp: "STTP",
  fdp: "FDP",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function ActivityCard({ item, i }: { item: DeptActivity; i: number }) {
  const linked = item.hasDetailPage;
  const body = (
    <div
      className={`group flex h-full flex-col overflow-hidden border border-line bg-surface ${
        linked
          ? "transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
          : ""
      }`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-paper-deep">
        {item.cardPhotoUrl ? (
          <Image
            src={item.cardPhotoUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <EntryCardPlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
          {(item.type && TYPE_LABELS[item.type]) || "Event"}
        </div>
        <h4 className="mt-1.5 font-display text-lg font-medium leading-tight text-navy">
          {item.title}
        </h4>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink-mute">
          {formatDate(item.startDate)}
          {item.endDate && item.endDate !== item.startDate && <> — {formatDate(item.endDate)}</>}
        </p>
        {item.notes && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{item.notes}</p>
        )}
        {linked && (
          <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-navy transition-colors group-hover:text-crimson">
            Read more
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Reveal delay={i * 0.03}>
      {item.hasDetailPage ? (
        <Link href={`/campus-life/events/${item.slug}`} className="block h-full">
          {body}
        </Link>
      ) : (
        body
      )}
    </Reveal>
  );
}

function ActivityGrid({ items }: { items: DeptActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-soft">No events yet.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a, i) => (
        <ActivityCard key={a.id} item={a} i={i} />
      ))}
    </div>
  );
}

export function DeptActivitiesView({ activities = [] }: { activities?: DeptActivity[] }) {
  const items = activities.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <ActivityGrid items={items} />
    </div>
  );
}
