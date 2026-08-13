import type { Metadata } from "next";
import { PageHero } from "@/components/site-next/PageHero";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { Reveal } from "@/components/site-next/Reveal";
import { Quote } from "lucide-react";
import { getAlumniPage, getAllTestimonials } from "@/lib/pages.functions";

export const metadata: Metadata = {
  title: "Alumni Network — SVIT Vasad",
};

export default async function Alumni() {
  const [alumniPage, testimonials] = await Promise.all([
    getAlumniPage().catch(() => null),
    getAllTestimonials().catch(() => []),
  ]);
  const kpis = alumniPage?.kpis ?? [];

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
            <Reveal key={t.id}>
              <blockquote className="card-lift h-full rounded-2xl border border-border bg-white p-8">
                <Quote className="h-8 w-8 text-gold" />
                <p className="mt-4 text-lg leading-relaxed text-ink italic">"{t.quote}"</p>
                <footer className="mt-6 border-t border-border pt-4">
                  <div className="font-display font-bold text-navy">{t.author_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.author_role}{t.company_or_institution ? `, ${t.company_or_institution}` : ""}
                  </div>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
