'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Users, CalendarDays, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/campus-life", label: "Overview", icon: Home, exact: true },
  { to: "/campus-life/facilities", label: "Facilities", icon: Building2 },
  { to: "/campus-life/clubs", label: "Clubs", icon: Users },
  { to: "/campus-life/events", label: "Events", icon: CalendarDays },
  { to: "/student-corner", label: "Societies", icon: GraduationCap },
];

export function CampusLifeNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Campus Life sections"
      className="min-w-0 rounded-2xl border-2 border-navy/15 bg-white p-3 shadow-sm"
    >
      <div className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-crimson">
        Campus Life
      </div>
      <ul className="-mx-1 flex min-w-0 gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname?.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <li key={item.to} className="shrink-0 lg:shrink">
              <Link
                href={item.to}
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
  );
}
