import { clubBlurb } from "@/lib/club-blurb";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { Building2, Users, CalendarDays, ArrowRight } from "lucide-react";
import { getAllStudentClubs } from "@/lib/clubs.functions";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getAllEvents } from "@/lib/events.functions";
import { getVisibleCenters } from "@/lib/centers.functions";

export const metadata: Metadata = {
  title: "Campus Life Overview — SVIT Vasad",
  description: "An overview of facilities, clubs and flagship events at SVIT Vasad.",
  alternates: { canonical: "/campus-life" },
};

// The overview shows only the latest few of each category; the full lists live on their own pages.
const RECENT_EVENTS = 4;
const RECENT_CLUBS = 8;
const RECENT_CENTERS = 6;

const byNewest = (a: { created_at: string }, b: { created_at: string }) =>
  b.created_at.localeCompare(a.created_at);

function ViewAll({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-crimson hover:underline"
    >
      {label} <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

export default async function CampusLifeOverview() {
  const [clubs, facilities, events, centers] = await Promise.all([
    getAllStudentClubs().catch(() => []),
    getAllFacilities().catch(() => []),
    getAllEvents().catch(() => []),
    getVisibleCenters().catch(() => []),
  ]);

  const SUMMARY = [
    { icon: Building2, label: "Facilities", count: facilities.length, to: "/campus-life/facilities" },
    { icon: Users, label: "Student Groups", count: clubs.length + centers.length, to: "/campus-life/student-groups" },
    { icon: CalendarDays, label: "Flagship Events", count: events.length, to: "/campus-life/events" },
  ] as const;

  // Events already come back newest-first (start_date desc); clubs/centers are name-ordered.
  const recentEvents = events.slice(0, RECENT_EVENTS);
  const recentClubs = [...clubs].sort(byNewest).slice(0, RECENT_CLUBS);
  const recentCenters = [...centers].sort(byNewest).slice(0, RECENT_CENTERS);

  return (
    <div className="space-y-12">
      <div>
        <SectionHeading eyebrow="Overview" title="Life beyond the classroom" subtitle="From cricket grounds and smart classrooms to TEDx and Prakarsh, campus life at SVIT is designed around student initiative." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <Link href={s.to} className="block h-full border border-line bg-surface p-6 transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep">
                <div className="flex h-10 w-10 items-center justify-center bg-paper-deep text-navy">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-3xl font-medium text-navy">{s.count}+</div>
                <div className="mt-1 text-sm font-semibold text-ink-soft">{s.label}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-crimson">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Flagship Events" title="Signature moments each year" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {recentEvents.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.04}>
              <Link
                href={`/campus-life/events/${e.slug}`}
                className="block h-full border border-line bg-surface p-6 transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{e.accent_color ?? e.tag}</div>
                <h3 className="mt-2 font-display text-xl font-medium text-navy">{e.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{e.subtitle ?? e.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <ViewAll href="/campus-life/events" label="View all events" />
      </div>

      <div>
        <SectionHeading eyebrow="Student Clubs" title="Find your tribe" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentClubs.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              {c.has_detail_page ? (
                <Link
                  href={`/campus-life/clubs/${c.slug}`}
                  className="block h-full border border-line bg-surface p-5 transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
                >
                  <h4 className="font-display font-medium text-navy">{c.name}</h4>
                  <p className={`mt-2 text-sm text-ink-soft ${clubBlurb(c).isFallback ? "line-clamp-2" : ""}`}>{clubBlurb(c).text}</p>
                </Link>
              ) : (
                <div className="block h-full border border-line bg-surface p-5">
                  <h4 className="font-display font-medium text-navy">{c.name}</h4>
                  <p className={`mt-2 text-sm text-ink-soft ${clubBlurb(c).isFallback ? "line-clamp-2" : ""}`}>{clubBlurb(c).text}</p>
                </div>
              )}
            </Reveal>
          ))}
        </div>
        <ViewAll href="/campus-life/student-groups" label="View all clubs" />
      </div>

      <div>
        <SectionHeading eyebrow="Societies" title="Centres, cells and chapters" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentCenters.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              <Link
                href={`/student-corner/${c.slug}`}
                className="block h-full border border-line bg-surface p-5 transition-colors duration-300 hover:border-navy hover:bg-paper-deep active:border-navy active:bg-paper-deep"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {c.accent_color ?? "Centre"}
                </div>
                <h4 className="mt-1 font-display font-medium text-navy">{c.name}</h4>
                <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{c.subtitle ?? ""}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <ViewAll href="/campus-life/student-groups" label="View all centres & cells" />
      </div>
    </div>
  );
}
