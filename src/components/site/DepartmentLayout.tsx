import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Info, Users, Award, Briefcase } from "lucide-react";
import { PageHero } from "./PageHero";
import { CollegeLogo } from "./CollegeLogo";
import { CTABanner } from "./CTABanner";
import type { Department } from "@/lib/departments.functions";
import { cn } from "@/lib/utils";
import svitLogo from "@/assets/svit-logo.jpg.asset.json";
import svicaLogo from "@/assets/svica-logo.jpg.asset.json";
import svionLogo from "@/assets/svion-logo.png.asset.json";
import coaLogo from "@/assets/coa-svit-logo.png.asset.json";

const COLLEGE_MAP: Record<string, { shortCode: string; name: string; route: string; logo: string }> = {
  svit: { shortCode: "SVIT", name: "Sardar Vallabhbhai Patel Institute of Technology", route: "/colleges/svit", logo: svitLogo.url },
  svica: { shortCode: "SVICA", name: "Sardar Vallabhbhai Patel Institute of Computer Applications", route: "/colleges/svica", logo: svicaLogo.url },
  svion: { shortCode: "SVION", name: "Sardar Vallabhbhai Patel Institute of Nursing", route: "/colleges/svion", logo: svionLogo.url },
  "svit-coa": { shortCode: "COA", name: "College of Architecture", route: "/colleges/svit-coa", logo: coaLogo.url },
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
      >
        {department.logo_url && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-2 shadow-md">
            <img src={department.logo_url} alt={`${department.name} logo`} className="h-full w-full object-contain" />
          </div>
        )}
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

      <CTABanner />
    </>
  );
}
