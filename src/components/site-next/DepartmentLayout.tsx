"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Info, Users, Award, Briefcase, FlaskConical } from "lucide-react";
import { PageHero } from "./PageHero";
import { SectionSideNav } from "./SectionSideNav";
import type { Department } from "@/lib/departments.functions";
import type { CollegeRow } from "@/lib/homepage";

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
  {
    href: "/activities",
    label: "Departmental Events",
    icon: Briefcase,
    exact: false,
  },
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
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden border border-line bg-surface">
              <Image
                src={department.logo_url}
                alt={`${department.name} logo`}
                fill
                sizes="56px"
                className="object-contain p-1.5"
              />
            </div>
          ) : undefined
        }
      />

      <div className="bg-paper">
        <div className="container-page py-10">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <SectionSideNav
                title="In this department"
                ariaLabel="Department sections"
                items={NAV.map((item) => {
                  const href = `${base}${item.href}`;
                  // Department routes resolve case-insensitively (/departments/ca
                  // and /departments/CA), so match the active tab the same way.
                  const path = pathname?.toLowerCase() ?? "";
                  const target = href.toLowerCase();
                  return {
                    href,
                    label: item.label,
                    icon: item.icon,
                    active: item.exact
                      ? path === target
                      : path === target || path.startsWith(target + "/"),
                  };
                })}
              />
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
