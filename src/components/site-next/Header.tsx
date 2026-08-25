'use client';

import { useRef, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CalendarDays, ChevronDown, ChevronRight, Facebook, GraduationCap, Instagram, Mail, Menu, Phone, Trophy, Users, X } from "lucide-react";
import { Logo } from "./Logo";
import { CollegeLogo } from "./CollegeLogo";
import { cn } from "@/lib/utils";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import type { Department } from "@/lib/departments.functions";
import type { CollegeRow } from "@/lib/homepage";
import type { CampusEvent } from "@/lib/events.functions";
import type { MiscSettings } from "@/lib/site-settings.functions";
import type { ContactInfo } from "@/lib/pages.functions";
import type { Facility } from "@/lib/facilities.functions";
import type { StudentClub } from "@/lib/clubs.functions";
import type { Sport } from "@/lib/sports.functions";
import type { Center } from "@/lib/centers.functions";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const primaryNav = [
  { label: "Home", to: "/" },
  { label: "About SVIT", to: "/about" },
  { label: "Colleges", to: "/colleges" },
  { label: "Admissions", to: "/admissions" },
  { label: "Campus Life", to: "/campus-life" },
  { label: "Placement", to: "/placement" },
] as const;

const admissionsLinks = [
  { label: "Intake & Fees", to: "/admissions/intake-fees" },
  { label: "Scholarships", to: "/admissions/scholarships" },
] as const;
const topNav = [
  { label: "Parents", to: "/parents" },
  { label: "Alumni", to: "/alumni" },
  { label: "Careers", to: "/careers" },
] as const;

export interface HeaderProps {
  colleges: CollegeRow[];
  contactInfo: ContactInfo | null;
  misc: MiscSettings | null;
  departments: Department[];
  facilities: Facility[];
  featuredClubs: StudentClub[];
  events: CampusEvent[];
  sports: Sport[];
  centers: Center[];
  logoUrl: string | null;
}

export function Header({
  colleges: dbColleges,
  contactInfo,
  misc,
  departments: allDepartments,
  facilities,
  featuredClubs,
  events,
  sports,
  centers,
  logoUrl,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(false);

  // Mobile accordion states — all collapsed by default
  const [mobileCollegesOpen, setMobileCollegesOpen] = useState(false);
  const [mobileCampusOpen, setMobileCampusOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileAdmissionsOpen, setMobileAdmissionsOpen] = useState(false);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Scroll-triggered shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMobileMenu() {
    setOpen(false);
    setMobileCollegesOpen(false);
    setMobileCampusOpen(false);
    setMobileAboutOpen(false);
    setMobileAdmissionsOpen(false);
  }
  const pathname = usePathname();

  const collegesLabel = misc?.colleges_label || "Colleges";

  const site = {
    email: contactInfo?.email,
    phone: contactInfo?.phone,
    facebook: contactInfo?.social_links?.Facebook,
    instagram: contactInfo?.social_links?.Instagram,
    linkedin: contactInfo?.social_links?.LinkedIn,
  };

  const displayColleges = useMemo(() => {
    return (dbColleges ?? [])
      .filter((c) => (c as any).show_in_navigation !== false)
      .map((c) => ({
        id: c.slug,
        shortCode: c.code,
        name: c.name,
        tagline: (c as any).tagline ?? "",
        logo: c.logo_url ?? undefined,
      }));
  }, [dbColleges]);

  const departmentsByCollege = useMemo(() => {
    const map: Record<string, Department[]> = {};
    for (const d of allDepartments ?? []) {
      (map[d.college_slug] ??= []).push(d);
    }
    return map;
  }, [allDepartments]);

  const campusCategories = useCampusCategories({ facilities, featuredClubs, events, sports, centers });

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-shadow duration-200",
      scrolled ? "shadow-[0_1px_12px_0_oklch(0.18_0.02_260_/_0.08)]" : "shadow-none",
      open && "shadow-none"
    )}>
      {/* Top strip */}
      <div className="bg-navy-deep text-white/85 text-xs">
        <div className="container-page flex h-9 items-center justify-between">
          <div className="flex items-center gap-4">
            {site.email && (
              <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 hover:text-gold sm:inline-flex">
                <Mail className="h-3 w-3" /> {site.email}
              </a>
            )}
            {site.phone && (
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-gold">
                <Phone className="h-3 w-3" /> {site.phone}
              </a>
            )}
          </div>
          <nav className="hidden items-center gap-4 md:flex">
            {topNav.map((n) => (
              <Link key={n.to} href={n.to} className="hover:text-gold transition-colors">
                {n.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              {site.facebook && (
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gold transition-colors">
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {site.instagram && (
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold transition-colors">
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              )}
              {site.linkedin && (
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-gold transition-colors">
                  <LinkedinIcon className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-page flex h-20 items-center justify-between">
        <Logo logoUrl={logoUrl} />
        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname?.startsWith(n.to);
            if (n.label === "About SVIT") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setAboutOpen(true)}
                  onMouseLeave={() => setAboutOpen(false)}
                >
                  <Link
                    href={n.to}
                    className={cn(
                      "link-underline flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {aboutOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 3, scale: 0.98 }}
                        transition={{ duration: 0.08, ease: "easeOut" }}
                        className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-xl"
                        style={{ transformOrigin: "top center" }}
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {ABOUT_SECTIONS.map((s) => (
                            <Link
                              key={s.to}
                              href={s.to}
                              onClick={() => setAboutOpen(false)}
                              className="rounded-md px-3 py-2.5 text-sm font-semibold text-navy hover:bg-secondary transition-colors"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (n.label === "Admissions") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setAdmissionsOpen(true)}
                  onMouseLeave={() => setAdmissionsOpen(false)}
                >
                  <Link
                    href={n.to}
                    className={cn(
                      "link-underline flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {admissionsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 3, scale: 0.98 }}
                        transition={{ duration: 0.08, ease: "easeOut" }}
                        className="absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-xl"
                        style={{ transformOrigin: "top center" }}
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {admissionsLinks.map((s) => (
                            <Link
                              key={s.to}
                              href={s.to}
                              onClick={() => setAdmissionsOpen(false)}
                              className="rounded-md px-3 py-2.5 text-sm font-semibold text-navy hover:bg-secondary transition-colors"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (n.label === "Colleges") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setCoursesOpen(true)}
                  onMouseLeave={() => setCoursesOpen(false)}
                >
                  <Link
                    href={n.to}
                    className={cn(
                      "link-underline flex items-center gap-1 px-2.5 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {collegesLabel} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {coursesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 3, scale: 0.98 }}
                        transition={{ duration: 0.08, ease: "easeOut" }}
                        className="absolute left-1/2 top-full z-50 max-w-[92vw] -translate-x-1/2 pt-1"
                        style={{ transformOrigin: "top center" }}
                      >
                        <CollegesMega
                          colleges={displayColleges}
                          departmentsByCollege={departmentsByCollege}
                          onNavigate={() => setCoursesOpen(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (n.label === "Campus Life") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setCampusOpen(true)}
                  onMouseLeave={() => setCampusOpen(false)}
                >
                  <Link
                    href={n.to}
                    className={cn(
                      "link-underline flex items-center gap-1 px-2.5 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {campusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 3, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 3, scale: 0.98 }}
                        transition={{ duration: 0.08, ease: "easeOut" }}
                        className="absolute right-0 top-full z-50 w-[720px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
                        style={{ transformOrigin: "top right" }}
                      >
                        <CampusMega categories={campusCategories} onNavigate={() => setCampusOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "link-underline px-2.5 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap",
                  active ? "text-navy" : "text-ink/80 hover:text-navy"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admissions/inquiry"
            className="hidden rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft active:scale-95 transition-[background-color,transform] duration-100 md:inline-flex"
          >
            Apply Now
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-md border border-border p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <div className="max-h-[calc(100dvh-116px)] overflow-y-auto">
            <div className="container-page flex flex-col gap-1 py-4">
              {primaryNav.map((n) => {
                if (n.label === "About SVIT") {
                  return (
                    <div key={n.to}>
                      <button
                        type="button"
                        onClick={() => setMobileAboutOpen((o) => !o)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                      >
                        {n.label}
                        <motion.span animate={{ rotate: mobileAboutOpen ? 180 : 0 }} transition={{ duration: 0.1, ease: "easeOut" }}>
                          <ChevronDown className="h-4 w-4 text-navy/40" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileAboutOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3 pb-1">
                              {ABOUT_SECTIONS.map((s) => (
                                <Link key={s.to} href={s.to} onClick={closeMobileMenu} className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy">
                                  {s.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                if (n.label === "Admissions") {
                  return (
                    <div key={n.to}>
                      <button
                        type="button"
                        onClick={() => setMobileAdmissionsOpen((o) => !o)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                      >
                        {n.label}
                        <motion.span animate={{ rotate: mobileAdmissionsOpen ? 180 : 0 }} transition={{ duration: 0.1, ease: "easeOut" }}>
                          <ChevronDown className="h-4 w-4 text-navy/40" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileAdmissionsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3 pb-1">
                              {admissionsLinks.map((s) => (
                                <Link key={s.to} href={s.to} onClick={closeMobileMenu} className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy">
                                  {s.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                if (n.label === "Colleges") {
                  return (
                    <div key={n.to}>
                      <button
                        type="button"
                        onClick={() => setMobileCollegesOpen((o) => !o)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                      >
                        {collegesLabel}
                        <motion.span animate={{ rotate: mobileCollegesOpen ? 180 : 0 }} transition={{ duration: 0.1, ease: "easeOut" }}>
                          <ChevronDown className="h-4 w-4 text-navy/40" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileCollegesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3 pb-1">
                              {displayColleges.map((c) => (
                                <Link key={c.id} href={`/colleges/${c.id}`} onClick={closeMobileMenu} className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy">
                                  {c.shortCode} — {c.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                if (n.label === "Campus Life") {
                  return (
                    <div key={n.to}>
                      <button
                        type="button"
                        onClick={() => setMobileCampusOpen((o) => !o)}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                      >
                        {n.label}
                        <motion.span animate={{ rotate: mobileCampusOpen ? 180 : 0 }} transition={{ duration: 0.1, ease: "easeOut" }}>
                          <ChevronDown className="h-4 w-4 text-navy/40" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {mobileCampusOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.12, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <MobileCampusAccordion categories={campusCategories} onNavigate={closeMobileMenu} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={n.to}
                    href={n.to}
                    onClick={closeMobileMenu}
                    className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                  >
                    {n.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-border" />
              {topNav.map((n) => (
                <Link
                  key={n.to}
                  href={n.to}
                  onClick={closeMobileMenu}
                  className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
                >
                  {n.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 px-3 py-2">
                {site.facebook && (
                  <a href={site.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-navy">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {site.instagram && (
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-navy">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {site.linkedin && (
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-navy">
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
              <Link
                href="/admissions/inquiry"
                onClick={closeMobileMenu}
                className="mt-3 rounded-md bg-gold px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-navy-deep active:scale-95 transition-transform duration-75"
              >
                Apply Now
              </Link>
            </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

type MegaItem = { label: string; to: string };
type MegaCategory = {
  key: string;
  title: string;
  icon: typeof Building2;
  allLabel: string;
  allTo: string;
  items: MegaItem[];
};

function useCampusCategories({
  facilities,
  featuredClubs,
  events,
  sports,
  centers,
}: {
  facilities: Facility[];
  featuredClubs: StudentClub[];
  events: CampusEvent[];
  sports: Sport[];
  centers: Center[];
}): MegaCategory[] {
  return useMemo(() => [
    {
      key: "facilities",
      title: "Facilities",
      icon: Building2,
      allLabel: "All facilities",
      allTo: "/campus-life/facilities",
      items: (facilities ?? [])
        .filter((f) => f.category !== "sports")
        .map((f) => ({
          label: f.name,
          to: `/campus-life/facilities/${f.category ?? 'academic'}/${f.slug}`,
        })),
    },
    {
      key: "sports",
      title: "Sports",
      icon: Trophy,
      allLabel: "Sports & Athletics",
      allTo: "/campus",
      items: (sports ?? []).map((s) => ({
        label: s.name,
        to: `/campus#${s.slug ?? s.name.toLowerCase().replace(/\s+/g, "-")}`,
      })),
    },
    {
      key: "clubs",
      title: "Clubs",
      icon: Users,
      allLabel: "All clubs",
      allTo: "/campus-life/clubs",
      items: (featuredClubs ?? []).map((c) => ({ label: c.name, to: `/campus-life/clubs/${c.slug}` })),
    },
    {
      key: "events",
      title: "Events",
      icon: CalendarDays,
      allLabel: "All events",
      allTo: "/campus-life/events",
      items: (events ?? []).map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` })),
    },
    {
      key: "student-corner",
      title: "Societies",
      icon: GraduationCap,
      allLabel: "All centres",
      allTo: "/student-corner",
      items: (centers ?? []).map((c) => ({
        label: c.name.split("(")[0].trim(),
        to: `/student-corner/${c.slug}`,
      })),
    },
  ], [facilities, featuredClubs, events, sports, centers]);
}

type NavCollege = { id: string; shortCode: string; name: string; tagline: string; logo?: string };

function CollegesMega({
  colleges,
  departmentsByCollege,
  onNavigate,
}: {
  colleges: NavCollege[];
  departmentsByCollege: Record<string, Department[]>;
  onNavigate: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function activate(id: string) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(id), 20);
  }
  function deactivate() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(null), 120);
  }

  const active = colleges.find((c) => c.id === activeId) ?? null;
  const depts = active ? departmentsByCollege[active.id] ?? [] : [];

  return (
    <div
      className="flex items-start rounded-xl border border-border bg-white overflow-hidden"
      onMouseLeave={deactivate}
    >
      {/* College list */}
      <ul className="w-[380px] shrink-0 max-h-[440px] overflow-y-auto bg-secondary/30 py-3" role="menu">
        {colleges.map((c) => {
          const isActive = c.id === active?.id;
          return (
            <li key={c.id}>
              <Link
                href={`/colleges/${c.id}`}
                onMouseEnter={() => activate(c.id)}
                onFocus={() => setActiveId(c.id)}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 border-l-4 px-4 py-2.5 transition-colors",
                  isActive ? "border-crimson bg-white" : "border-transparent hover:bg-white/60"
                )}
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-9 w-9 shrink-0 rounded-md border border-border bg-white p-1 text-navy"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug text-navy">{c.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{c.shortCode}</div>
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 shrink-0 text-crimson transition-opacity",
                  isActive ? "opacity-100" : "opacity-0"
                )} />
              </Link>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06 }}
            className="w-[260px] shrink-0 border-l border-border bg-white py-3"
          >
            <div className="px-4 pb-1.5 text-xs font-bold uppercase tracking-widest text-crimson">
              {active.shortCode} Departments
            </div>
            <ul>
              {depts.length > 0 ? depts.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/departments/${d.code}`}
                    onClick={onNavigate}
                    className="block px-4 py-2 text-sm text-ink/80 hover:bg-secondary hover:text-navy transition-colors"
                  >
                    {d.name}
                  </Link>
                </li>
              )) : (
                <li className="px-4 py-2 text-sm text-muted-foreground">No departments listed yet.</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CampusMega({ categories, onNavigate }: { categories: MegaCategory[]; onNavigate: () => void }) {
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleActivate = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveKey(key), 30);
  };
  const cancelSchedule = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const active = categories.find((c) => c.key === activeKey) ?? categories[0];

  return (
    <div className="grid grid-cols-[220px_minmax(0,1fr)]">
      <ul className="border-r border-border bg-secondary/40 py-3" role="menu">
        {categories.map((c) => {
          const isActive = c.key === activeKey;
          const Icon = c.icon;
          return (
            <li key={c.key}>
              <button
                type="button"
                onMouseEnter={() => scheduleActivate(c.key)}
                onMouseLeave={cancelSchedule}
                onFocus={() => setActiveKey(c.key)}
                onClick={() => setActiveKey(c.key)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white text-navy border-l-4 border-crimson"
                    : "border-l-4 border-transparent text-ink/70 hover:bg-white/60 hover:text-navy"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-opacity", isActive ? "opacity-100 text-crimson" : "opacity-0")} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="min-h-[280px] p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.08 }}
          >
            <Link
              href={active.allTo}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:text-crimson"
            >
              {active.allLabel} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {active.items.map((it) => (
                <li key={it.to}>
                  <Link
                    href={it.to}
                    onClick={onNavigate}
                    className="block rounded px-2 py-1.5 text-sm text-ink/75 hover:bg-secondary hover:text-navy"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MobileCampusAccordion({ categories, onNavigate }: { categories: MegaCategory[]; onNavigate: () => void }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
      {categories.map((c) => {
        const isOpen = openKey === c.key;
        const Icon = c.icon;
        return (
          <div key={c.key}>
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : c.key)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
              aria-expanded={isOpen}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">{c.title}</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-navy/10 pl-3">
                <Link
                  href={c.allTo}
                  onClick={onNavigate}
                  className="rounded-md px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-crimson hover:bg-secondary"
                >
                  {c.allLabel}
                </Link>
                {c.items.map((it) => (
                  <Link
                    key={it.to}
                    href={it.to}
                    onClick={onNavigate}
                    className="rounded-md px-2 py-1.5 text-xs text-ink/70 hover:bg-secondary hover:text-navy"
                  >
                    {it.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
