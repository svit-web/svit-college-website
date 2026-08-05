import { useRef, useState, useMemo, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CalendarDays, ChevronDown, ChevronRight, Mail, Menu, Phone, Trophy, Users, X } from "lucide-react";
import { Logo } from "./Logo";
const fallbackSite = { email: "info@svitvasad.ac.in", phone: "+91 2692 274766" };
const primaryNav = [
  { label: "Home", to: "/" },
  { label: "About SVIT", to: "/about" },
  { label: "Colleges", to: "/colleges" },
  { label: "Admissions", to: "/admissions" },
  { label: "Campus Life", to: "/campus-life" },
  { label: "Student Corner", to: "/student-corner" },
  { label: "Placement", to: "/placement" },
  { label: "Contact Us", to: "/contact" },
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
import { getAllFacilities } from "@/lib/facilities.functions";
import { getAllEvents } from "@/lib/events.functions";
import { getAllDepartments, type Department } from "@/lib/departments.functions";
import { CollegeLogo } from "./CollegeLogo";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { collegesQuery, contactInfoQuery } from "@/lib/homepage";
import { getFeaturedStudentClubs } from "@/lib/clubs.functions";
import { getSports } from "@/lib/sports.functions";
import { ABOUT_SECTIONS } from "@/lib/about-sections";

export function Header() {
  const [open, setOpen] = useState(false);
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

  function closeMobileMenu() {
    setOpen(false);
    setMobileCollegesOpen(false);
    setMobileCampusOpen(false);
    setMobileAboutOpen(false);
    setMobileAdmissionsOpen(false);
  }
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: dbColleges } = useQuery(collegesQuery);
  const { data: contactInfo } = useQuery(contactInfoQuery);

  const site = {
    email: contactInfo?.email ?? fallbackSite.email,
    phone: contactInfo?.phone ?? fallbackSite.phone,
  };

  const displayColleges = useMemo(() => {
    const EXCLUDED_SLUGS = ["abc123", "thesilicon", "the-silicon", "overview"];
    return (dbColleges ?? [])
      .filter(c => !EXCLUDED_SLUGS.includes(c.slug?.toLowerCase()))
      .map(c => ({
        id: c.slug,
        shortCode: (c as any).metadata?.shortCode ?? c.code,
        name: c.name,
        tagline: (c as any).metadata?.tagline ?? "",
        logo: c.logo_url ?? "",
      }));
  }, [dbColleges]);

  const { data: allDepartments } = useQuery({
    queryKey: ["departments", "all-for-nav"],
    queryFn: () => getAllDepartments(),
    staleTime: 1000 * 60 * 5,
  });
  const departmentsByCollege = useMemo(() => {
    const map: Record<string, Department[]> = {};
    for (const d of allDepartments ?? []) {
      (map[d.college_slug] ??= []).push(d);
    }
    return map;
  }, [allDepartments]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      {/* Top strip */}
      <div className="bg-navy-deep text-white/85 text-xs">
        <div className="container-page flex h-9 items-center justify-between">
          <div className="flex items-center gap-4">
            <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 hover:text-gold sm:inline-flex">
              <Mail className="h-3 w-3" /> {site.email}
            </a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-gold">
              <Phone className="h-3 w-3" /> {site.phone}
            </a>
          </div>
          <nav className="hidden items-center gap-4 md:flex">
            {topNav.map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-gold transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-page flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            if (n.label === "About SVIT") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setAboutOpen(true)}
                  onMouseLeave={() => setAboutOpen(false)}
                >
                  <Link
                    to={n.to}
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-xl"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {ABOUT_SECTIONS.map((s) => (
                            <Link
                              key={s.to}
                              to={s.to}
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
                    to={n.to}
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-xl"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {admissionsLinks.map((s) => (
                            <Link
                              key={s.to}
                              to={s.to}
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
                    to={n.to}
                    className={cn(
                      "link-underline flex items-center gap-1 px-2.5 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {coursesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full z-50 max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
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
                    to={n.to}
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full z-50 w-[720px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
                      >
                        <CampusMega onNavigate={() => setCampusOpen(false)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <Link
                key={n.to}
                to={n.to}
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
            to="/admissions/inquiry"
            className="hidden rounded-md bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft transition-colors md:inline-flex"
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
            transition={{ duration: 0.15 }}
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
                        <ChevronDown className={cn("h-4 w-4 transition-transform text-navy/40", mobileAboutOpen && "rotate-180")} />
                      </button>
                      {mobileAboutOpen && (
                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
                          {ABOUT_SECTIONS.map((s) => (
                            <Link
                              key={s.to}
                              to={s.to}
                              onClick={closeMobileMenu}
                              className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      )}
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
                        <ChevronDown className={cn("h-4 w-4 transition-transform text-navy/40", mobileAdmissionsOpen && "rotate-180")} />
                      </button>
                      {mobileAdmissionsOpen && (
                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
                          {admissionsLinks.map((s) => (
                            <Link
                              key={s.to}
                              to={s.to}
                              onClick={closeMobileMenu}
                              className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      )}
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
                        {n.label}
                        <ChevronDown className={cn("h-4 w-4 transition-transform text-navy/40", mobileCollegesOpen && "rotate-180")} />
                      </button>
                      {mobileCollegesOpen && (
                        <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
                          {displayColleges.map((c) => (
                            <Link
                              key={c.id}
                              to="/colleges/$college"
                              params={{ college: c.id }}
                              onClick={closeMobileMenu}
                              className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
                            >
                              {c.shortCode} — {c.name}
                            </Link>
                          ))}
                        </div>
                      )}
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
                        <ChevronDown className={cn("h-4 w-4 transition-transform text-navy/40", mobileCampusOpen && "rotate-180")} />
                      </button>
                      {mobileCampusOpen && <MobileCampusAccordion onNavigate={closeMobileMenu} />}
                    </div>
                  );
                }
                return (
                  <Link
                    key={n.to}
                    to={n.to}
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
                  to={n.to}
                  onClick={closeMobileMenu}
                  className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/admissions/inquiry"
                onClick={closeMobileMenu}
                className="mt-3 rounded-md bg-gold px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-navy-deep"
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

function useCampusCategories(): MegaCategory[] {
  const staleTime = 1000 * 60 * 5; // 5 minutes

  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => getAllFacilities(),
    staleTime,
  });

  const { data: featuredClubs } = useQuery({
    queryKey: ['featured-clubs'],
    queryFn: () => getFeaturedStudentClubs(),
    staleTime,
  });

  const { data: events } = useQuery({
    queryKey: ['campus-events'],
    queryFn: () => getAllEvents(),
    staleTime,
  });

  const { data: sports } = useQuery({
    queryKey: ['sports'],
    queryFn: () => getSports(),
    staleTime,
  });

  return [
    {
      key: "facilities",
      title: "Facilities",
      icon: Building2,
      allLabel: "All facilities",
      allTo: "/campus-life/facilities",
      items: (facilities ?? [])
        .filter((f) => f.metadata?.category !== "sports")
        .map((f) => ({
          label: f.name,
          to: `/campus-life/facilities/${f.metadata?.category ?? 'academic'}/${f.slug}`,
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
        to: "/campus",
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
  ];
}

type NavCollege = { id: string; shortCode: string; name: string; tagline: string; logo: string };

/**
 * Desktop-only "Colleges" mega-menu: hovering a college on the left reveals
 * its departments (with logos) on the right; clicking a department goes
 * straight to /departments/$dept. The college row itself still links to
 * /colleges/$college like before — hover only adds the flyout.
 */
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

  const scheduleActivate = (id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(id), 80);
  };
  const scheduleDeactivate = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveId(null), 150);
  };

  const active = colleges.find((c) => c.id === activeId) ?? null;
  const depts = active ? departmentsByCollege[active.id] ?? [] : [];

  return (
    <div className="flex" onMouseLeave={scheduleDeactivate}>
      <ul className="w-[320px] shrink-0 max-h-[440px] overflow-y-auto bg-secondary/40 py-3" role="menu">
        {colleges.map((c) => {
          const isActive = c.id === active?.id;
          return (
            <li key={c.id}>
              <Link
                to="/colleges/$college"
                params={{ college: c.id }}
                onMouseEnter={() => scheduleActivate(c.id)}
                onFocus={() => setActiveId(c.id)}
                onClick={onNavigate}
                className={cn(
                  "flex items-start gap-3 border-l-4 px-4 py-2.5 transition-colors",
                  isActive ? "border-crimson bg-white" : "border-transparent hover:bg-white/60"
                )}
              >
                <CollegeLogo
                  shortCode={c.shortCode}
                  src={c.logo}
                  className="h-9 w-9 shrink-0 rounded-md border border-border bg-white p-1 text-navy"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-snug text-navy">{c.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{c.shortCode} — {c.tagline}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {active && (
          <motion.div
            key="panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 440, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 overflow-hidden border-l border-border"
          >
            <div className="max-h-[440px] w-[440px] overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                    {active.shortCode} Departments
                  </div>
                  {depts.length > 0 ? (
                    <ul className="mt-3 grid grid-cols-2 gap-1.5">
                      {depts.map((d) => (
                        <li key={d.id}>
                          <Link
                            to="/departments/$dept"
                            params={{ dept: d.code }}
                            onClick={onNavigate}
                            className="flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-secondary"
                          >
                            {d.logo_url ? (
                              <img
                                src={d.logo_url}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-md border border-border bg-white object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/60 text-[10px] font-bold text-navy">
                                {d.code}
                              </div>
                            )}
                            <span className="truncate text-sm text-ink/80">{d.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">No departments listed yet.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CampusMega({ onNavigate }: { onNavigate: () => void }) {
  const categories = useCampusCategories();
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleActivate = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActiveKey(key), 120);
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
            transition={{ duration: 0.15 }}
          >
            <Link
              to={active.allTo}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:text-crimson"
            >
              {active.allLabel} <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {active.items.map((it) => (
                <li key={it.to}>
                  <Link
                    to={it.to}
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

function MobileCampusAccordion({ onNavigate }: { onNavigate: () => void }) {
  const categories = useCampusCategories();
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
                  to={c.allTo}
                  onClick={onNavigate}
                  className="rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-crimson hover:bg-secondary"
                >
                  {c.allLabel}
                </Link>
                {c.items.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
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

