"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollegeLogo } from "../CollegeLogo";
import type { Department } from "@/lib/departments.functions";

type NavCollege = { id: string; shortCode: string; name: string; logo?: string };

// Master–detail flyout: colleges on the left, the hovered/focused college's
// departments on the right. The selection sticks (no close-on-leave), so the
// pointer can travel diagonally from a college to its departments without the
// pane flickering, and the first college is pre-selected so it's never empty.
export function CollegesMegaPanel({
  colleges,
  departmentsByCollege,
}: {
  colleges: NavCollege[];
  departmentsByCollege: Record<string, Department[]>;
}) {
  const [activeId, setActiveId] = useState<string | null>(colleges[0]?.id ?? null);
  const active = colleges.find((c) => c.id === activeId) ?? colleges[0];
  const depts = active ? (departmentsByCollege[active.id] ?? []) : [];
  const deptColumnsClass = depts.length > 8 ? "grid-cols-3" : depts.length > 3 ? "grid-cols-2" : "";

  if (!active) return null;

  return (
    <div className="grid min-h-[330px] grid-cols-[300px_1fr] gap-x-10 py-6">
      {/* Colleges */}
      <ul className="border-r border-border pr-6">
        {colleges.map((c) => {
          const isActive = c.id === active.id;
          return (
            <li key={c.id}>
              <Link
                href={`/colleges/${c.id}`}
                onMouseEnter={() => setActiveId(c.id)}
                onFocus={() => setActiveId(c.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isActive ? "bg-secondary/70 text-crimson" : "text-navy hover:bg-secondary/40",
                )}
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-8 w-8 shrink-0 rounded-md border border-border bg-white p-0.5 text-navy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-[0.14em]">
                    {c.shortCode}
                  </span>
                  <span className="block truncate text-[12.5px] text-ink-mute">{c.name}</span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Departments of the active college */}
      <div key={active.id} className="min-w-0 animate-in fade-in duration-150">
        <Link
          href={`/colleges/${active.id}`}
          className="group mb-4 inline-flex items-center gap-2 border-b border-border pb-2"
        >
          <span className="text-sm font-bold text-navy group-hover:text-crimson">
            {active.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-crimson">
            View college
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        {depts.length > 0 ? (
          <ul className={cn("grid gap-x-8 gap-y-1", deptColumnsClass)}>
            {depts.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/departments/${d.code}`}
                  className="flex items-center gap-2.5 rounded-md py-1.5 text-[14px] text-ink/85 transition-colors hover:text-crimson"
                >
                  {d.logo_url ? (
                    <img
                      src={d.logo_url}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span className="h-5 w-5 shrink-0" aria-hidden />
                  )}
                  <span>{d.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No departments listed yet.</p>
        )}
      </div>
    </div>
  );
}
