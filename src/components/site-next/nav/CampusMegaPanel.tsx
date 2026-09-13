"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Building2, CalendarDays, ChevronRight, Shield, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Facility } from "@/lib/facilities.functions";
import type { StudentClub } from "@/lib/clubs.functions";
import type { CampusEvent } from "@/lib/events.functions";
import type { Sport } from "@/lib/sports.functions";
import type { Center } from "@/lib/centers.functions";

type MegaItem = { label: string; to: string };
export type CampusMegaCategory = {
  key: string;
  title: string;
  icon: typeof Building2;
  allLabel: string;
  allTo: string;
  items: MegaItem[];
};

export function useCampusCategories({
  facilities,
  featuredClubs,
  events,
  sports,
  centers,
}: {
  facilities: Facility[];
  featuredClubs: StudentClub[];
  events: CampusEvent[];
  sports: Sport[];
  centers: Center[];
}): CampusMegaCategory[] {
  return useMemo(
    () => [
      {
        key: "facilities",
        title: "Facilities",
        icon: Building2,
        allLabel: "All facilities",
        allTo: "/campus-life/facilities",
        items: (facilities ?? [])
          .filter((f) => f.category !== "sports")
          .map((f) => ({
            label: f.name,
            to: `/campus-life/facilities/${f.category ?? "academic"}/${f.slug}`,
          })),
      },
      {
        key: "sports",
        title: "Sports",
        icon: Trophy,
        allLabel: "Sports & Athletics",
        allTo: "/campus-life/sports-and-athletics",
        items: (sports ?? []).map((s) => ({
          label: s.name,
          to: `/campus-life/sports-and-athletics#${s.slug ?? s.name.toLowerCase().replace(/\s+/g, "-")}`,
        })),
      },
      {
        key: "student-groups",
        title: "Student Groups",
        icon: Users,
        allLabel: "All student groups",
        allTo: "/campus-life/student-groups",
        items: [
          ...(featuredClubs ?? []).map((c) => ({
            label: c.name,
            to: `/campus-life/clubs/${c.slug}`,
          })),
          ...(centers ?? []).map((c) => ({
            label: c.name.split("(")[0].trim(),
            to: `/student-corner/${c.slug}`,
          })),
        ],
      },
      {
        key: "events",
        title: "Events",
        icon: CalendarDays,
        allLabel: "All events",
        allTo: "/campus-life/events",
        items: (events ?? []).map((c) => ({
          label: c.title.split("—")[0].trim(),
          to: `/campus-life/events/${c.slug}`,
        })),
      },
      {
        key: "coe",
        title: "Centre of Excellence",
        icon: Award,
        allLabel: "Centre of Excellence",
        allTo: "/coe",
        items: [],
      },
      {
        key: "nss-ncc",
        title: "NSS / NCC",
        icon: Shield,
        allLabel: "NSS / NCC",
        allTo: "/campus-life/nss-ncc",
        items: [],
      },
    ],
    [facilities, featuredClubs, events, sports, centers],
  );
}

export function CampusMegaPanel({ categories }: { categories: CampusMegaCategory[] }) {
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleActivate = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveKey(key), 30);
  };
  const cancelSchedule = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const active = categories.find((c) => c.key === activeKey) ?? categories[0];

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)]">
      <ul className="border-r border-border bg-secondary/40 py-3" role="menu">
        {categories.map((c) => {
          const isActive = c.key === activeKey;
          const Icon = c.icon;
          return (
            <li key={c.key}>
              <button
                type="button"
                onMouseEnter={() => scheduleActivate(c.key)}
                onMouseLeave={cancelSchedule}
                onFocus={() => setActiveKey(c.key)}
                onClick={() => setActiveKey(c.key)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                  isActive
                    ? "border-l-4 border-crimson bg-white text-navy"
                    : "border-l-4 border-transparent text-ink/70 hover:bg-white/60 hover:text-navy",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-opacity",
                    isActive ? "opacity-100 text-crimson" : "opacity-0",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-h-[280px] p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.08 }}
          >
            <Link
              href={active.allTo}
              className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:text-crimson"
            >
              {active.allLabel} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {active.items.map((it) => (
                <li key={it.to}>
                  <Link
                    href={it.to}
                    className="block rounded px-2 py-1.5 text-sm text-ink/75 hover:bg-secondary hover:text-navy"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
