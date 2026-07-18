import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail, Menu, Phone, X } from "lucide-react";
import { Logo } from "./Logo";
import { primaryNav, site, topNav } from "@/data/site";
import { colleges } from "@/data/colleges";
import { placementDivisions } from "@/data/placement";
import { academicFacilities, sportsFacilities, centreDetails, clubDetails, eventDetails } from "@/data/campus-rfe";
import { CollegeLogo } from "./CollegeLogo";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [placementOpen, setPlacementOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
                          {colleges.map((c) => (
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
                  <button
                    type="button"
                    onClick={() => setPlacementOpen((o) => !o)}
                    className={cn(
                      "link-underline flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wider",
                      active ? "text-navy" : "text-ink/80 hover:text-navy"
                    )}
                    aria-haspopup="menu"
                    aria-expanded={placementOpen}
                  >
                    {n.label} <ChevronDown className="h-3 w-3" />
                  </button>
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
                        className="absolute right-0 top-full z-50 w-[900px] max-w-[92vw] rounded-2xl border border-border bg-white p-6 shadow-xl"
                      >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                          <MegaColumn
                            title="Facilities"
                            heading={{ label: "All facilities", to: "/campus-life/facilities" }}
                            items={[
                              ...academicFacilities.slice(0, 3).map((f) => ({ label: f.title, to: `/campus-life/facilities/academic/${f.slug}` })),
                              ...sportsFacilities.slice(0, 4).map((f) => ({ label: f.title, to: `/campus-life/facilities/co-curriculum/${f.slug}` })),
                            ]}
                          />
                          <MegaColumn
                            title="Co-curricular"
                            heading={{ label: "All centres", to: "/campus-life/centre" }}
                            items={centreDetails.slice(0, 8).map((c) => ({ label: c.title.split("(")[0].trim(), to: `/campus-life/centre/${c.slug}` }))}
                          />
                          <MegaColumn
                            title="Clubs"
                            heading={{ label: "All clubs", to: "/campus-life/clubs" }}
                            items={clubDetails.map((c) => ({ label: c.title, to: `/campus-life/clubs/${c.slug}` }))}
                          />
                          <MegaColumn
                            title="Events"
                            heading={{ label: "All events", to: "/campus-life/events" }}
                            items={eventDetails.map((c) => ({ label: c.title.split("—")[0].trim(), to: `/campus-life/events/${c.slug}` }))}
                          />
                        </div>
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
                      {colleges.map((c) => (
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

function MegaColumn({
  title,
  heading,
  items,
}: {
  title: string;
  heading: { label: string; to: string };
  items: { label: string; to: string }[];
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-crimson">{title}</div>
      <Link to={heading.to} className="block text-sm font-bold text-navy hover:text-crimson">
        {heading.label} →
      </Link>
      <ul className="mt-3 space-y-1.5">
        {items.map((it) => (
          <li key={it.to}>
            <Link to={it.to} className="block text-xs text-ink/75 hover:text-navy">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
