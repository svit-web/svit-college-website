"use client";

import { useMemo, useState } from "react";
import { Logo } from "./Logo";
import { DesktopUtilityBar } from "./nav/DesktopUtilityBar";
import { SiteSearch } from "./SiteSearch";
import { MobileUtilityBar } from "./nav/MobileUtilityBar";
import { MobileNavPanel } from "./nav/MobileNavPanel";
import { DesktopNavItem } from "./nav/DesktopNavItem";
import { LinksMegaPanel } from "./nav/LinksMegaPanel";
import { CollegesMegaPanel } from "./nav/CollegesMegaPanel";
import { CampusMegaPanel, useCampusCategories } from "./nav/CampusMegaPanel";
import type { MenuTopItem } from "@/lib/menus.functions";
import type { Department } from "@/lib/departments.functions";
import type { CollegeRow } from "@/lib/homepage";
import type { CampusEvent } from "@/lib/events.functions";
import type { ContactInfo } from "@/lib/site-settings.functions";
import type { Facility } from "@/lib/facilities.functions";
import type { StudentClub } from "@/lib/clubs.functions";
import type { Sport } from "@/lib/sports.functions";
import type { Center } from "@/lib/centers.functions";

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
      default:
        return null;
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[60] lg:absolute">
      {/* Desktop navbar — single hovering card, floats over hero */}
      <div className="hidden lg:block">
        <div className="relative px-[clamp(32px,6vw,96px)] pt-3">
          <div className="mx-auto w-full max-w-[1240px]">
            <div className="relative bg-cream">
              <DesktopUtilityBar utilityNav={utilityNav} contactInfo={contactInfo} />
              <div className="relative flex h-[76px] items-center gap-2 px-[clamp(12px,2vw,26px)]">
                <Logo logoUrl={logoUrl} instituteName={contactInfo?.full_name} />
                <ul className="ml-auto flex h-full items-stretch">
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
                <SiteSearch
                  className="ml-2 pl-2 text-ink-soft transition-colors hover:text-crimson"
                  iconClassName="h-[18px] w-[18px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileUtilityBar
        open={mobileOpen}
        onToggle={() => setMobileOpen((o) => !o)}
        logoUrl={logoUrl}
        instituteName={contactInfo?.full_name}
      />
      <MobileNavPanel
        open={mobileOpen}
        mainNav={mainNav}
        utilityNav={utilityNav}
        colleges={displayColleges}
        departmentsByCollege={departmentsByCollege}
        campusCategories={campusCategories}
        contactInfo={contactInfo}
        onNavigate={() => setMobileOpen(false)}
      />
    </header>
  );
}
