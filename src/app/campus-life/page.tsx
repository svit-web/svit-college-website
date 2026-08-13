import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { Building2, Users, CalendarDays, GraduationCap, ArrowRight } from "lucide-react";
import { getAllStudentClubs } from "@/lib/clubs.functions";
import { getAllFacilities } from "@/lib/facilities.functions";
import { getAllEvents } from "@/lib/events.functions";
import { getAllCenters } from "@/lib/centers.functions";

export const metadata: Metadata = {
  title: "Campus Life Overview — SVIT Vasad",
  description: "An overview of facilities, clubs and flagship events at SVIT Vasad.",
};

export default async function CampusLifeOverview() {
  const [clubs, facilities, events, centers] = await Promise.all([
    getAllStudentClubs().catch(() => []),
    getAllFacilities().catch(() => []),
    getAllEvents().catch(() => []),
    getAllCenters().catch(() => []),
  ]);

  const SUMMARY = [
    { icon: Building2, label: "Facilities", count: facilities.length, to: "/campus-life/facilities" },
    { icon: Users, label: "Student Clubs", count: clubs.length, to: "/campus-life/clubs" },
    { icon: CalendarDays, label: "Flagship Events", count: events.length, to: "/campus-life/events" },
    { icon: GraduationCap, label: "Societies", count: centers.length, to: "/student-corner" },
  ] as const;

  return (
    <div className="space-y-12">
      <div>
        <SectionHeading eyebrow="Overview" title="Life beyond the classroom" subtitle="From cricket grounds and smart classrooms to TEDx and Prakarsh, campus life at SVIT is designed around student initiative." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <Link href={s.to} className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-display text-3xl font-bold text-navy">{s.count}+</div>
                <div className="mt-1 text-sm font-semibold text-muted-foreground">{s.label}</div>
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
          {events.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.04}>
              <Link
                href={`/campus-life/events/${e.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{e.accent_color ?? e.tag}</div>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.subtitle ?? e.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Student Clubs" title="Find your tribe" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clubs.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              <Link
                href={`/campus-life/clubs/${c.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <h4 className="font-display font-bold text-navy">{c.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{c.subtitle ?? c.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Societies" title="Centres, cells and chapters" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              <Link
                href={`/student-corner/${c.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {c.accent_color ?? "Centre"}
                </div>
                <h4 className="mt-1 font-display font-bold text-navy">{c.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{c.subtitle ?? ""}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
