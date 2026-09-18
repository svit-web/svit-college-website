"use client";

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
  return (
    <div className="py-6">
      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        {colleges.map((c) => {
          const depts = departmentsByCollege[c.id] ?? [];
          // If this college has >6 departments, split into 2 columns within its grid cell
          const deptColumnsClass = depts.length > 6 ? "grid-cols-2 gap-x-4" : "";

          return (
            <div key={c.id} className="min-w-0">
              <Link
                href={`/colleges/${c.id}`}
                className="group mb-2 inline-flex items-center gap-2 border-b border-border pb-1.5"
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-5 w-5 shrink-0 rounded border border-border bg-white p-0.5 text-navy"
                />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-navy group-hover:text-crimson">
                  {c.shortCode}
                </span>
                <ArrowRight className="h-2.5 w-2.5 shrink-0 text-crimson opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              {depts.length > 0 ? (
                <ul className={cn("grid gap-x-3", deptColumnsClass)}>
                  {depts.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/departments/${d.code}`}
                        className="block py-0.5 text-[13px] leading-snug text-ink/80 transition-colors hover:text-crimson"
                      >
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">No departments</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
