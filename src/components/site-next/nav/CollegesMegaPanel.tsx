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
  // Determine column layout based on college count
  const columnsClass =
    colleges.length >= 3 ? "sm:grid-cols-3" : colleges.length > 1 ? "sm:grid-cols-2" : "";

  return (
    <div className="py-10">
      <div className={cn("grid gap-x-8 gap-y-8", columnsClass)}>
        {colleges.map((c) => {
          const depts = departmentsByCollege[c.id] ?? [];
          return (
            <div key={c.id}>
              <Link
                href={`/colleges/${c.id}`}
                className="group mb-3 inline-flex items-center gap-2.5 border-b border-border pb-3"
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-7 w-7 shrink-0 rounded-md border border-border bg-white p-1 text-navy"
                />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy group-hover:text-crimson">
                  {c.shortCode}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-crimson opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              {depts.length > 0 ? (
                <ul>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
