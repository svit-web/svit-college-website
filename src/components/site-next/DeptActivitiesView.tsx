"use client";

import Image from "next/image";
import Link from "next/link";
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
  const body = (
    <div className="card-lift h-full rounded-2xl border-2 border-navy/15 bg-white overflow-hidden hover:border-gold transition-colors">
      <div className="relative aspect-video w-full overflow-hidden bg-navy">
        {item.cardPhotoUrl ? (
          <Image src={item.cardPhotoUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        ) : (
          <EntryCardPlaceholder />
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-crimson">
          {(item.type && TYPE_LABELS[item.type]) || "Event"}
        </div>
        <h4 className="mt-1 font-display font-bold text-navy">{item.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(item.startDate)}
          {item.endDate && item.endDate !== item.startDate && <> — {formatDate(item.endDate)}</>}
        </p>
        {item.notes && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.notes}</p>
        )}
      </div>
    </div>
  );

  return (
    <Reveal delay={i * 0.03}>
      {item.hasDetailPage ? (
        <Link href={`/campus-life/events/${item.slug}`}>{body}</Link>
      ) : (
        body
      )}
    </Reveal>
  );
}

function ActivityGrid({ items }: { items: DeptActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No events yet.</p>;
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
