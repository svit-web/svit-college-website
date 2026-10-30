"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  LibraryBig,
  Users,
  CalendarDays,
  Trophy,
  Shield,
  Award,
} from "lucide-react";
import { SectionTabs } from "./SectionTabs";
import { LIBRARY_PATH } from "@/lib/library-paths";
import { COE_PATH, NSS_NCC_PATH } from "@/lib/center-paths";

const NAV: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/campus-life", label: "Overview", icon: Home, exact: true },
  { to: "/campus-life/facilities", label: "Facilities", icon: Building2 },
  { to: LIBRARY_PATH, label: "Central Library", icon: LibraryBig },
  { to: "/campus-life/student-groups", label: "Student Groups", icon: Users },
  { to: COE_PATH, label: "Centre of Excellence", icon: Award },
  { to: "/campus-life/events", label: "Events", icon: CalendarDays },
  { to: "/campus-life/sports-and-athletics", label: "Sports & Athletics", icon: Trophy },
  { to: NSS_NCC_PATH, label: "NSS / NCC", icon: Shield },
];

export function CampusLifeNav() {
  const pathname = usePathname();
  return (
    <SectionTabs
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
