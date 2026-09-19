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
    <div className="grid min-h-[300px] grid-cols-[260px_minmax(0,1fr)] gap-x-10 py-6">
      <ul className="border-r border-border pr-6" role="menu">
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
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  isActive ? "bg-secondary/70 text-crimson" : "text-navy hover:bg-secondary/40",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-w-0">
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
              className="group mb-4 inline-flex items-center gap-2 border-b border-border pb-2 text-sm font-bold text-navy hover:text-crimson"
            >
              {active.allLabel}
              <span className="flex items-center gap-1 text-xs font-semibold text-crimson">
                View all <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1">
              {active.items.map((it) => (
                <li key={it.to}>
                  <Link
                    href={it.to}
                    className="block rounded-md py-1.5 text-[14px] text-ink/85 transition-colors hover:text-crimson"
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
