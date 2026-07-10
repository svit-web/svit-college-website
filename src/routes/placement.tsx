import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { recruiters } from "@/data/site";
import { Award, Briefcase, LineChart, Users, Trophy, Handshake } from "lucide-react";

export const Route = createFileRoute("/placement")({
  head: () => ({ meta: [{ title: "Placements — SVIT Vasad" }, { name: "description", content: "95%+ placement, ₹42 LPA highest package, 200+ recruiting partners. See the SVIT placement story." }] }),
  component: Placement,
});

const kpis = [
  { v: "95%+", l: "Placement Rate" },
  { v: "₹42 LPA", l: "Highest Package" },
  { v: "200+", l: "Recruiting Partners" },
  { v: "1200+", l: "Offers in 2025" },
];

const support = [
  { icon: LineChart, t: "Aptitude & Coding Training", d: "Weekly aptitude, DSA and coding sessions from Year 2 onwards." },
  { icon: Users, t: "Mock Interviews", d: "Panel and one-on-one interviews with industry professionals." },
  { icon: Award, t: "Certifications", d: "AWS, Google, Microsoft, Coursera partnerships for professional certs." },
  { icon: Handshake, t: "Company Connect", d: "Regular alumni and industry meet-ups, mentorship circles." },
  { icon: Trophy, t: "Skill Contests", d: "Hackathons, case-study competitions and design sprints." },
  { icon: Briefcase, t: "Internships", d: "Structured summer & winter internships with 150+ partners." },
];

function Placement() {
  return (
    <>
      <PageHero title="Placements" accent="Careers Ready" subtitle="Two decades of building careers — SVIT graduates lead engineering, business and research teams across the world." crumbs={[{ label: "Home", to: "/" }, { label: "Placement" }]} />

      <section className="bg-navy text-white py-14">
        <div className="container-page grid grid-cols-2 gap-6 md:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.l} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-gold">{k.v}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-white/70">{k.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Recruiters" title="200+ Companies. One Campus." />
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {recruiters.map((r) => (
            <Reveal key={r}>
              <div className="card-lift flex h-20 items-center justify-center rounded-md border border-border bg-white font-display text-lg font-bold text-navy">{r}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Support" title="Training & Placement Support" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {support.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><s.icon className="h-5 w-5" /></div>
                  <h4 className="mt-4 font-display font-bold text-navy">{s.t}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
