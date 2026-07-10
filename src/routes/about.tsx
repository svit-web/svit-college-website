import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CTABanner } from "@/components/site/CTABanner";
import { stats } from "@/data/site";
import campusAerial from "@/assets/campus-aerial.jpg";
import { Eye, Target, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About SVIT Vasad — Legacy, Vision & Values" }, { name: "description", content: "Two decades of academic excellence — the story, vision, mission and values of SVIT Vasad." }] }),
  component: About,
});

const timeline = [
  { year: "2005", title: "Founded", desc: "SVIT established with 3 engineering branches and 240 seats." },
  { year: "2010", title: "MBA & MCA launched", desc: "Postgraduate programmes added to expand horizons." },
  { year: "2016", title: "Research centre", desc: "Institute-wide research and innovation hub established." },
  { year: "2021", title: "AI & Data Science", desc: "New-age branches added: AI-DS, AI-ML, Cyber Security." },
  { year: "2026", title: "20 Years of Excellence", desc: "Celebrating two decades and 20,000+ alumni impact." },
];

function About() {
  return (
    <>
      <PageHero title="About SVIT" accent="Our Story" subtitle="A legacy of academic excellence, innovation and community impact since 2005." crumbs={[{ label: "Home", to: "/" }, { label: "About" }]} />

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-2xl">
              <img src={campusAerial} alt="Campus aerial" className="w-full" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-crimson">Our Story</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold text-navy">Building futures for two decades</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">Sardar Vallabhbhai Institute of Technology, Vasad, was founded in 2005 with a simple mission — deliver world-class technical education rooted in Indian values. Today, we're a 5000-student, 15-acre institution with 12 engineering branches and postgraduate programmes in management and applied sciences.</p>
            <p className="mt-3 text-muted-foreground leading-relaxed">Our graduates lead engineering teams, launch startups and shape policy across India and beyond — carrying forward SVIT's culture of rigour, integrity and curiosity.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {[
            { icon: Eye, title: "Vision", body: "To be a globally respected institute nurturing engineers, leaders and citizens who advance human wellbeing." },
            { icon: Target, title: "Mission", body: "Deliver outcome-based education, invest in research, and build partnerships that translate learning into real-world impact." },
            { icon: Heart, title: "Values", body: "Integrity, curiosity, inclusion, service. These four values guide every classroom, lab and hallway." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="card-lift h-full rounded-2xl border border-border bg-white p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy/5 text-navy"><c.icon className="h-5 w-5" /></div>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Milestones" title="Our Journey" variant="eyebrow" />
        <div className="mt-14 relative">
          <div className="absolute left-1/2 top-0 hidden h-full w-px bg-border md:block" />
          <ul className="space-y-10">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.05}>
                <li className={`md:grid md:grid-cols-2 md:gap-12 ${i % 2 === 1 ? "md:[&>*:first-child]:col-start-2" : ""}`}>
                  <div className={`md:${i % 2 === 1 ? "text-left" : "text-right"} relative`}>
                    <div className="font-display text-4xl font-bold text-gold">{t.year}</div>
                    <div className="mt-1 font-display text-lg font-bold text-navy">{t.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy text-white py-14">
        <div className="container-page grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.slice(0, 4).map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl font-bold text-gold">{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
