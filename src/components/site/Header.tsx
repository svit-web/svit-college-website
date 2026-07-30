import { useRef, useState, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, CalendarDays, ChevronDown, ChevronRight, Mail, Menu, Phone, Sparkles, Trophy, Users, X } from "lucide-react";
import { Logo } from "./Logo";
const fallbackSite = { email: "info@svitvasad.ac.in", phone: "+91 2692 274766" };
const primaryNav = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Colleges", to: "/colleges" },
  { label: "Campus Life", to: "/campus-life" },
  { label: "Placement", to: "/placement" },
  { label: "Contact Us", to: "/contact" },
] as const;
const topNav = [
  { label: "Parents", to: "/parents" },
  { label: "Alumni", to: "/alumni" },
  { label: "Careers", to: "/careers" },
] as const;
import { getAllFacilities } from "@/lib/facilities.functions";
import { getAllCenters } from "@/lib/centers.functions";
import { getAllEvents } from "@/lib/events.functions";
import { CollegeLogo } from "./CollegeLogo";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { collegesQuery, contactInfoQuery } from "@/lib/homepage";
import { getFeaturedStudentClubs } from "@/lib/clubs.functions";
import { getSports } from "@/lib/sports.functions";

export function Header() {
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
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

  const placementDivisions = useMemo(() => {
    const ALLOWED_PLACEMENT_SLUGS = ["svit-degree", "svit-coa", "svica", "svion"];
    return displayColleges
      .filter(c => ALLOWED_PLACEMENT_SLUGS.includes(c.id))
      .map(c => ({ slug: c.id, label: c.shortCode }));
  }, [displayColleges]);

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
                      "link-underline flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider",
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
                        className="absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 rounded-2xl border border-border bg-white p-4 shadow-xl"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {displayColleges.map((c) => (
                            <Link
                              key={c.id}
                              to="/colleges/$college"
                              params={{ college: c.id }}
                              className="flex items-start gap-3 rounded-md p-3 hover:bg-secondary transition-colors"
                            >
                              <CollegeLogo
                                shortCode={c.shortCode}
                                src={c.logo}
                                className="h-10 w-10 shrink-0 rounded-md border border-border bg-secondary/50 p-1 text-navy"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-navy truncate">{c.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{c.shortCode} — {c.tagline}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (n.label === "Placement") {
              return (
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setPlacementOpen(true)}
                  onMouseLeave={() => setPlacementOpen(false)}
                >
                  <Link
                    to="/placement/$college"
                    params={{ college: "overview" }}
                    onClick={() => setPlacementOpen(false)}
                    className={cn(
                      "link-underline flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </Link>
                  <AnimatePresence>
                    {placementOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-xl"
                      >
                        <div className="grid grid-cols-1 gap-1">
                          {placementDivisions.map((d) => (
                            <Link
                              key={d.slug}
                              to="/placement/$college"
                              params={{ college: d.slug }}
                              onClick={() => setPlacementOpen(false)}
                              className="rounded-md px-3 py-2.5 text-sm font-semibold text-navy hover:bg-secondary transition-colors"
                            >
                              {d.label}
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
                <div
                  key={n.to}
                  className="relative"
                  onMouseEnter={() => setCampusOpen(true)}
                  onMouseLeave={() => setCampusOpen(false)}
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
                  "link-underline px-3 py-2 text-sm font-semibold uppercase tracking-wider",
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
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {primaryNav.map((n) => (
                <div key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink/80 hover:bg-secondary hover:text-navy"
                  >
                    {n.label}
                  </Link>
                  {n.label === "Placement" && (
                    <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
                      {placementDivisions.map((d) => (
                        <Link
                          key={d.slug}
                          to="/placement/$college"
                          params={{ college: d.slug }}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  {n.label === "Colleges" && (
                    <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-navy/10 pl-3">
                      {displayColleges.map((c) => (
                        <Link
                          key={c.id}
                          to="/colleges/$college"
                          params={{ college: c.id }}
                          onClick={() => setOpen(false)}
                          className="rounded-md px-3 py-2 text-xs font-semibold text-navy/80 hover:bg-secondary hover:text-navy"
                        >
                          {c.shortCode} — {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {n.label === "Campus Life" && <MobileCampusAccordion onNavigate={() => setOpen(false)} />}
                </div>
              ))}
              <div className="my-2 border-t border-border" />
              {topNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/admissions/inquiry"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-md bg-gold px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-navy-deep"
              >
                Apply Now
              </Link>
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

  const { data: centers } = useQuery({
    queryKey: ['centers'],
    queryFn: () => getAllCenters(),
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
      key: "co-curricular",
      title: "Co-curricular",
      icon: Sparkles,
      allLabel: "All centres",
      allTo: "/campus-life/centre",
      items: (centers ?? []).map((c) => ({ label: c.name.split("(")[0].trim(), to: `/campus-life/centre/${c.slug}` })),
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

