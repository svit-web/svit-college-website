'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "./SectionHeading";
import type { DeptActivity, DeptActivityType } from "@/lib/department-content.functions";
import {
  Users,
  Calendar,
  FileText,
  Handshake,
  Presentation,
  Building2,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

const ACTIVITY_TABS: { id: DeptActivityType; label: string; icon: typeof Mic }[] = [
  { id: "sttp_fdp", label: "STTP / FDP / Conference", icon: Presentation },
  { id: "expert_lecture", label: "Expert Lectures", icon: Mic },
  { id: "seminar_workshop", label: "Seminars & Workshops", icon: Users },
  { id: "mou", label: "MOUs", icon: Handshake },
  { id: "industry_visit", label: "Industry Visits", icon: Building2 },
];

function ActivityList({ items }: { items: DeptActivity[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No entries yet.</p>;
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
  const [tab, setTab] = useState<DeptActivityType>("sttp_fdp");
  const items = activities
    .filter((a) => a.type === tab)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div>
      <SectionHeading eyebrow="Industry Interaction & Activities" title="Learning Beyond the Classroom" />

      <div className="mt-6 flex flex-wrap gap-2">
        {ACTIVITY_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all",
                isActive ? "border-gold bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-gold"
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <ActivityList items={items} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
