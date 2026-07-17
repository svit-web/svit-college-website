import { createFileRoute, Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Building2, Sparkles, Users, CalendarDays, ArrowRight } from "lucide-react";
import { centreDetails, clubDetails, eventDetails, academicFacilities, sportsFacilities } from "@/data/campus-rfe";

export const Route = createFileRoute("/campus-life/")({
  head: () => ({
    meta: [
      { title: "Campus Life Overview — SVIT Vasad" },
      { name: "description", content: "An overview of facilities, centres, clubs and flagship events at SVIT Vasad." },
    ],
  }),
  component: CampusLifeOverview,
});

const SUMMARY = [
  { icon: Building2, label: "Facilities", count: academicFacilities.length + sportsFacilities.length, to: "/campus-life/facilities" },
  { icon: Sparkles, label: "Co-curricular Centres", count: centreDetails.length, to: "/campus-life/centre" },
  { icon: Users, label: "Student Clubs", count: clubDetails.length, to: "/campus-life/clubs" },
  { icon: CalendarDays, label: "Flagship Events", count: eventDetails.length, to: "/campus-life/events" },
] as const;

function CampusLifeOverview() {
  return (
    <div className="space-y-12">
      <div>
        <SectionHeading eyebrow="Overview" title="Life beyond the classroom" subtitle="From cricket grounds and smart classrooms to TEDx and Prakarsh, campus life at SVIT is designed around student initiative." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <Link to={s.to} className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold">
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
          {eventDetails.map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.04}>
              <Link
                to="/campus-life/events/$slug"
                params={{ slug: e.slug }}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-6 hover:border-gold"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{e.accent}</div>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">{e.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{e.subtitle}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div>
        <SectionHeading eyebrow="Student Clubs" title="Find your tribe" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clubDetails.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.04}>
              <Link
                to="/campus-life/clubs/$slug"
                params={{ slug: c.slug }}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <h4 className="font-display font-bold text-navy">{c.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
