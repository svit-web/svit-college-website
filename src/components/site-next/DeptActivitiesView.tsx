'use client';

import { SectionHeading } from "./SectionHeading";
import type { DeptActivity } from "@/lib/department-content.functions";
import {
  Calendar,
  FileText,
} from "lucide-react";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function ActivityList({ items }: { items: DeptActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No events yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="rounded-xl border-2 border-navy/15 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-crimson">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(a.startDate)}
            {a.endDate && a.endDate !== a.startDate && <span>— {formatDate(a.endDate)}</span>}
          </div>
          <div className="mt-1 font-display text-sm font-bold text-navy">{a.title}</div>
          {a.company && <div className="text-xs text-muted-foreground">{a.company}</div>}
          {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
          {a.documentUrl && (
            <a href={a.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-gold-strong">
              <FileText className="h-3.5 w-3.5" /> View more
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DeptActivitiesView({ activities = [] }: { activities?: DeptActivity[] }) {
  const items = activities.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <SectionHeading eyebrow="Departmental Events" title="Learning Beyond the Classroom" />
      <div className="mt-6">
        <ActivityList items={items} />
      </div>
    </div>
  );
}
