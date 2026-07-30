import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Info, Users, Award, Briefcase } from "lucide-react";
import { PageHero } from "./PageHero";
import { CollegeLogo } from "./CollegeLogo";
import type { Department } from "@/lib/departments.functions";
import { cn } from "@/lib/utils";
const BASE = "https://agezrfclusigfqysbxwb.supabase.co/storage/v1/object/public/media/logos";

const COLLEGE_MAP: Record<string, { shortCode: string; name: string; route: string; logo: string }> = {
  "svit-degree": { shortCode: "SVIT",    name: "Sardar Vallabhbhai Patel Institute of Technology", route: "/colleges/svit-degree", logo: `${BASE}/svit.jpg` },
  "svit-diploma":{ shortCode: "SVIT-P",  name: "SVIT Polytechnic",                                 route: "/colleges/svit-diploma", logo: `${BASE}/svit.jpg` },
  svica:         { shortCode: "SVICA",   name: "Sardar Vallabhbhai Patel Institute of Computer Applications", route: "/colleges/svica", logo: `${BASE}/svica.jpg` },
  svion:         { shortCode: "SVION",   name: "Sardar Vallabhbhai Patel Institute of Nursing",     route: "/colleges/svion", logo: `${BASE}/svion.png` },
  "svit-coa":    { shortCode: "COA",     name: "College of Architecture",                          route: "/colleges/svit-coa", logo: `${BASE}/coa-svit.png` },
};

interface Props {
  department: Department;
}

const NAV = [
  { to: "/departments/$dept", label: "About & Programs", icon: Info, exact: true },
  { to: "/departments/$dept/staff", label: "Staff", icon: Users, exact: false },
  { to: "/departments/$dept/achievements", label: "Achievements & Clubs", icon: Award, exact: false },
  { to: "/departments/$dept/activities", label: "Industry Interaction & Activities", icon: Briefcase, exact: false },
] as const;

export function DepartmentLayout({ department }: Props) {
  const college = COLLEGE_MAP[department.college_slug];
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav aria-label="Department sections" className="rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm">
                <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-crimson">
                  In this department
                </div>
                <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                  {NAV.map((item) => {
                    const href = item.to === "/departments/$dept" ? base : `${base}${item.to.replace("/departments/$dept", "")}`;
                    const isActive = item.exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
                    const Icon = item.icon;
                    return (
                      <li key={item.to} className="shrink-0 lg:shrink">
                        <Link
                          to={item.to}
                          params={{ dept: department.code }}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all",
                            isActive
                              ? "border-gold bg-navy text-white shadow-sm"
                              : "border-transparent text-navy hover:border-navy/15 hover:bg-secondary/60"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap lg:whitespace-normal">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            <div className="min-w-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
