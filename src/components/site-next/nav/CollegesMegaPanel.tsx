"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollegeLogo } from "../CollegeLogo";
import type { Department } from "@/lib/departments.functions";

type NavCollege = { id: string; shortCode: string; name: string; logo?: string };

export function CollegesMegaPanel({
  colleges,
  departmentsByCollege,
}: {
  colleges: NavCollege[];
  departmentsByCollege: Record<string, Department[]>;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = colleges.find((c) => c.id === activeId) ?? null;
  const depts = active ? (departmentsByCollege[active.id] ?? []) : [];
  const twoCol = depts.length > 8;

  return (
    <div
      className="grid grid-cols-[280px_minmax(0,1fr)] gap-0 py-8"
      onMouseLeave={() => setActiveId(null)}
    >
      <ul className="max-h-[420px] overflow-y-auto border-r border-border pr-6" role="menu">
        {colleges.map((c) => {
          const isActive = c.id === active?.id;
          return (
            <li key={c.id}>
              <Link
                href={`/colleges/${c.id}`}
                onMouseEnter={() => setActiveId(c.id)}
                onFocus={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive ? "bg-secondary text-navy" : "text-ink/80 hover:bg-secondary/60",
                )}
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-9 w-9 shrink-0 rounded-md border border-border bg-white p-1 text-navy"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">{c.shortCode}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="pl-8">
        {!active && (
          <p className="text-sm italic text-muted-foreground">
            Hover a college to view its departments
          </p>
        )}
        {active && (
          <>
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-crimson">
              {active.shortCode} Departments
            </div>
            {depts.length > 0 ? (
              <ul className={cn("grid gap-x-8", twoCol && "grid-cols-2")}>
                {depts.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/departments/${d.code}`}
                      className="block py-1.5 text-[14.5px] text-ink/80 transition-colors hover:text-crimson"
                    >
                      {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No departments listed yet.</p>
            )}
            <Link
              href={`/colleges/${active.id}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-crimson"
            >
              View college <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
