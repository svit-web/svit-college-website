import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { Music, Camera, Code2, Palette, Newspaper, Rocket } from "lucide-react";

export const Route = createFileRoute("/campus-life")({
  head: () => ({ meta: [{ title: "Campus Life — SVIT Vasad" }, { name: "description", content: "Clubs, cultural fests, sports meets and student life at SVIT Vasad." }] }),
  component: CampusLife,
});

const clubs = [
  { icon: Code2, t: "Coding Club", d: "Weekly contests, hackathons and open-source contributions." },
  { icon: Music, t: "Music Society", d: "Band practice, unplugged nights and inter-college performances." },
  { icon: Palette, t: "Art Circle", d: "Painting, calligraphy and design workshops." },
  { icon: Camera, t: "Photography Club", d: "Campus photowalks, exhibitions and gear tutorials." },
  { icon: Newspaper, t: "Literary Club", d: "Debates, MUNs and the campus magazine 'Ananya'." },
  { icon: Rocket, t: "Entrepreneurship Cell", d: "Startup mentorship, pitch nights and incubation support." },
];

const fests = [
  { t: "Ananya", d: "Annual cultural fest — 3 days of music, dance, drama and food." },
  { t: "TechFest", d: "National tech symposium with 50+ colleges participating." },
  { t: "Sportlon", d: "Inter-department sports and athletics tournament." },
];

function CampusLife() {
  return (
    <>
      <PageHero title="Campus Life" accent="Beyond the Classroom" subtitle="50+ clubs, three flagship fests and a culture that celebrates every talent." crumbs={[{ label: "Home", to: "/" }, { label: "Campus Life" }]} />

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Clubs" title="Find your tribe" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.05}>
              <div className="card-lift h-full rounded-2xl border border-border bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-navy/5 text-navy"><c.icon className="h-5 w-5" /></div>
                <h4 className="mt-4 font-display font-bold text-navy">{c.t}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy text-white py-20">
        <div className="container-page">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Annual Festivals</div>
            <h2 className="mt-2 font-display text-4xl font-bold">Three flagships. One vibrant year.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {fests.map((f) => (
              <Reveal key={f.t}>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-8 text-center">
                  <h3 className="font-display text-2xl font-bold text-gold">{f.t}</h3>
                  <p className="mt-3 text-sm text-white/80">{f.d}</p>
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
