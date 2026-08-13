'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, Users, Award, Briefcase, FlaskConical } from "lucide-react";
import { PageHero } from "./PageHero";
import { CollegeLogo } from "./CollegeLogo";
import type { Department } from "@/lib/departments.functions";
import type { CollegeRow } from "@/lib/homepage";
import { cn } from "@/lib/utils";

interface Props {
  department: Department;
  college: CollegeRow | null;
  children: React.ReactNode;
}

const NAV = [
  { href: "", label: "About & Programs", icon: Info, exact: true },
  { href: "/staff", label: "Staff", icon: Users, exact: false },
  { href: "/labs", label: "Labs & Facilities", icon: FlaskConical, exact: false },
  { href: "/achievements", label: "Achievements & Clubs", icon: Award, exact: false },
  { href: "/activities", label: "Industry Interaction & Activities", icon: Briefcase, exact: false },
] as const;

export function DepartmentLayout({ department, college: collegeRow, children }: Props) {
  const college = collegeRow
    ? {
        shortCode: collegeRow.code,
        name: collegeRow.name,
        route: `/colleges/${collegeRow.slug}`,
        logo: collegeRow.logo_url ?? "",
      }
    : null;
  const pathname = usePathname();
  const base = `/departments/${department.code}`;

  return (
    <>
      <PageHero
        title={department.name}
        accent={college ? `${college.shortCode} · Department` : "Department"}
        subtitle={`Explore programs, faculty, achievements and industry engagement at the Department of ${department.name}.`}
        crumbs={[
          { label: "Home", to: "/" },
          ...(college ? [{ label: college.shortCode, to: college.route }] : []),
          { label: department.name },
        ]}
        rightSlot={
          department.logo_url ? (
            <div className="flex h-72 w-72 items-center justify-center overflow-hidden rounded-3xl bg-white/10 p-4 shadow-2xl ring-1 ring-white/20 backdrop-blur-sm">
              <img src={department.logo_url} alt={`${department.name} logo`} className="h-full w-full object-contain" />
            </div>
          ) : undefined
        }
      >
        {college && (
          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
            <CollegeLogo shortCode={college.shortCode} src={college.logo} className="h-8 w-8 rounded-full bg-white p-0.5" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/90">{college.name}</span>
          </div>
        )}
      </PageHero>

      <div className="bg-secondary/30">
        <div className="container-page py-10">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <nav aria-label="Department sections" className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm">
                <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-crimson">
                  In this department
                </div>
                <ul className="flex flex-col gap-1">
                  {NAV.map((item) => {
                    const href = `${base}${item.href}`;
                    const isActive = item.exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                            isActive
                              ? "border-gold bg-navy text-white shadow-sm"
                              : "border-transparent text-navy hover:border-navy/15 hover:bg-secondary/60"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
