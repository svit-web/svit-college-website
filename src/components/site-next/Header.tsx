"use client";

import { useMemo, useState } from "react";
import { Logo } from "./Logo";
import { DesktopUtilityBar } from "./nav/DesktopUtilityBar";
import { MobileUtilityBar } from "./nav/MobileUtilityBar";
import { MobileNavPanel } from "./nav/MobileNavPanel";
import { DesktopNavItem } from "./nav/DesktopNavItem";
import { LinksMegaPanel } from "./nav/LinksMegaPanel";
import { CollegesMegaPanel } from "./nav/CollegesMegaPanel";
import { CampusMegaPanel, useCampusCategories } from "./nav/CampusMegaPanel";
import { PlacementMegaPanel } from "./nav/PlacementMegaPanel";
import type { MenuTopItem } from "@/lib/menus.functions";
import type { Department } from "@/lib/departments.functions";
import type { CollegeRow } from "@/lib/homepage";
import type { CampusEvent } from "@/lib/events.functions";
import type { ContactInfo } from "@/lib/site-settings.functions";
import type { Facility } from "@/lib/facilities.functions";
import type { StudentClub } from "@/lib/clubs.functions";
import type { Sport } from "@/lib/sports.functions";
import type { Center } from "@/lib/centers.functions";
import type { LiveStats } from "@/lib/stats.functions";

export interface HeaderProps {
  mainNav: MenuTopItem[];
  utilityNav: MenuTopItem[];
  colleges: CollegeRow[];
  contactInfo: ContactInfo | null;
  departments: Department[];
  facilities: Facility[];
  featuredClubs: StudentClub[];
  events: CampusEvent[];
  sports: Sport[];
  centers: Center[];
  liveStats: LiveStats | null;
  logoUrl: string | null;
}

export function Header({
  mainNav,
  utilityNav,
  colleges: dbColleges,
  contactInfo,
  departments: allDepartments,
  facilities,
  featuredClubs,
  events,
  sports,
  centers,
  liveStats,
  logoUrl,
}: HeaderProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayColleges = useMemo(
    () =>
      (dbColleges ?? [])
        .filter((c) => c.show_in_navigation !== false)
        .map((c) => ({
          id: c.slug,
          shortCode: c.code,
          name: c.name,
          logo: c.logo_url ?? undefined,
        })),
    [dbColleges],
  );

  const departmentsByCollege = useMemo(() => {
    const map: Record<string, Department[]> = {};
    for (const d of allDepartments ?? []) {
      (map[d.college_slug] ??= []).push(d);
    }
    return map;
  }, [allDepartments]);

  const campusCategories = useCampusCategories({
    facilities,
    featuredClubs,
    events,
    sports,
    centers,
  });

  function megaFor(item: MenuTopItem) {
    switch (item.menu_type) {
      case "links_mega":
        return <LinksMegaPanel item={item} />;
      case "colleges_mega":
        return (
          <CollegesMegaPanel
            colleges={displayColleges}
            departmentsByCollege={departmentsByCollege}
          />
        );
      case "campus_mega":
        return <CampusMegaPanel categories={campusCategories} />;
      case "placement_mega":
        return <PlacementMegaPanel liveStats={liveStats} />;
      default:
        return null;
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 lg:absolute">
      {/* Desktop navbar — single card with utility bar integrated at top, floats over hero */}
      <div className="hidden lg:block">
        <div className="container-page py-3">
          <div className="relative bg-cream shadow-[0_26px_50px_-34px_rgba(16,16,58,.45)]">
            {/* Integrated utility bar */}
            <DesktopUtilityBar utilityNav={utilityNav} contactInfo={contactInfo} />

            {/* Main nav bar */}
            <div className="flex h-[76px] items-center gap-2 px-[clamp(12px,2vw,26px)]">
              <Logo logoUrl={logoUrl} />
              <ul className="ml-auto flex items-center">
                {mainNav.map((item) => {
                  const mega = megaFor(item);
                  return (
                    <DesktopNavItem
                      key={item.id}
                      item={item}
                      isOpen={openKey === item.id}
                      onOpen={() => setOpenKey(item.id)}
                      onClose={() => setOpenKey(null)}
                    >
                      {mega}
                    </DesktopNavItem>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <MobileUtilityBar
        open={mobileOpen}
        onToggle={() => setMobileOpen((o) => !o)}
        logoUrl={logoUrl}
      />
      <MobileNavPanel
        open={mobileOpen}
        mainNav={mainNav}
        utilityNav={utilityNav}
        colleges={displayColleges}
        campusCategories={campusCategories}
        contactInfo={contactInfo}
        onNavigate={() => setMobileOpen(false)}
      />
    </header>
  );
}
