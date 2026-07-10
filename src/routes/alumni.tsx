import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { Quote } from "lucide-react";

export const Route = createFileRoute("/alumni")({
  head: () => ({ meta: [{ title: "Alumni Network — SVIT Vasad" }] }),
  component: Alumni,
});

const kpis = [
  { v: "20k+", l: "Alumni" },
  { v: "40", l: "Countries" },
  { v: "200+", l: "Mentors" },
];

const testimonials = [
  { name: "Rajesh Patel", role: "Senior Engineering Manager, Google", text: "SVIT gave me the foundation and courage to build a career in Silicon Valley. The mentors here shape not just careers, but character." },
  { name: "Neha Shah", role: "Founder, Fintech Startup", text: "The entrepreneurship cell at SVIT set me on the path of building my own company. Two decades on, I still return every year to mentor students." },
];

function Alumni() {
  return (
    <>
      <PageHero title="Alumni Network" accent="20,000+ Strong" subtitle="From engineering leaders to founders — our alumni carry SVIT's values across 40 countries." crumbs={[{ label: "Home", to: "/" }, { label: "Alumni" }]} />

      <section className="bg-navy text-white py-14">
        <div className="container-page grid grid-cols-3 gap-6">
          {kpis.map((k) => (
            <div key={k.l} className="text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-gold">{k.v}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-white/70">{k.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Voices" title="In their words" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <Reveal key={t.name}>
              <blockquote className="card-lift h-full rounded-2xl border border-border bg-white p-8">
                <Quote className="h-8 w-8 text-gold" />
                <p className="mt-4 text-lg leading-relaxed text-ink italic">"{t.text}"</p>
                <footer className="mt-6 border-t border-border pt-4">
                  <div className="font-display font-bold text-navy">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
