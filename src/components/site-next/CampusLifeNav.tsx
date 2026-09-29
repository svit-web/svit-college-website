"use client";

import { usePathname } from "next/navigation";
import { Home, Building2, Users, CalendarDays, Trophy, Shield } from "lucide-react";
import { SectionSideNav } from "./SectionSideNav";

const NAV: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/campus-life", label: "Overview", icon: Home, exact: true },
  { to: "/campus-life/facilities", label: "Facilities", icon: Building2 },
  { to: "/campus-life/student-groups", label: "Student Groups", icon: Users },
  { to: "/campus-life/events", label: "Events", icon: CalendarDays },
  { to: "/campus-life/sports-and-athletics", label: "Sports & Athletics", icon: Trophy },
  { to: "/campus-life/nss-ncc", label: "NSS / NCC", icon: Shield },
];

export function CampusLifeNav() {
  const pathname = usePathname();
  return (
    <SectionSideNav
      title="Campus Life"
      ariaLabel="Campus Life sections"
      items={NAV.map((item) => ({
        href: item.to,
        label: item.label,
        icon: item.icon,
        active: item.exact
          ? pathname === item.to
          : pathname === item.to || !!pathname?.startsWith(item.to + "/"),
      }))}
    />
  );
}
