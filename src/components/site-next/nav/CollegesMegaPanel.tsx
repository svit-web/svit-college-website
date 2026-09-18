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
  // Split colleges: SVIT and DIP get their own columns, others share the third
  const svit = colleges.find((c) => c.shortCode === "SVIT");
  const dip = colleges.find((c) => c.shortCode === "DIP");
  const others = colleges.filter((c) => c.shortCode !== "SVIT" && c.shortCode !== "DIP");

  const CollegeSection = ({ college }: { college: NavCollege }) => {
    const depts = departmentsByCollege[college.id] ?? [];
    // Split into 2 columns if >10 departments
    const deptColumnsClass = depts.length > 10 ? "grid-cols-2 gap-x-5" : "";

    return (
      <div>
        <Link
          href={`/colleges/${college.id}`}
          className="group mb-3 inline-flex items-center gap-2.5 border-b border-border pb-2"
        >
          <CollegeLogo
            shortCode={college.shortCode}
            src={college.logo}
            className="h-6 w-6 shrink-0 rounded border border-border bg-white p-0.5 text-navy"
          />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-navy group-hover:text-crimson">
            {college.shortCode}
          </span>
          <ArrowRight className="h-3 w-3 shrink-0 text-crimson opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>

        {depts.length > 0 ? (
          <ul className={cn("grid", deptColumnsClass)}>
            {depts.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/departments/${d.code}`}
                  className="block py-1 text-[13.5px] leading-relaxed text-ink/80 transition-colors hover:text-crimson"
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
  };

  return (
    <div className="py-8">
      <div className="grid grid-cols-3 gap-x-10 gap-y-6">
        {/* Column 1: SVIT */}
        {svit && <CollegeSection college={svit} />}

        {/* Column 2: Diploma */}
        {dip && <CollegeSection college={dip} />}

        {/* Column 3: Other colleges stacked */}
        <div className="space-y-6">
          {others.map((c) => (
            <CollegeSection key={c.id} college={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
