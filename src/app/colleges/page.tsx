import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site-next/PageHero";
import { CollegeLogo } from "@/components/site-next/CollegeLogo";
import { Reveal } from "@/components/site-next/Reveal";
import { getAllColleges } from "@/lib/colleges.functions";
import { getMiscSettings } from "@/lib/site-settings.functions";

export async function generateMetadata(): Promise<Metadata> {
  const misc = await getMiscSettings().catch(() => null);
  const label = misc?.colleges_label ?? "Colleges";
  return {
    title: `Our ${label} — SVIT Group`,
    description: "Explore the four constituent colleges of the SVIT Group — SVIT, SVICA, SVION, and SVIT COA.",
    openGraph: {
      title: `Our ${label} — SVIT Group`,
      description: "Explore the four constituent colleges of the SVIT Group.",
    },
  };
}

export default async function CollegesIndex() {
  const [colleges, misc] = await Promise.all([
    getAllColleges().catch(() => []),
    getMiscSettings().catch(() => null),
  ]);
  const collegesLabel = misc?.colleges_label ?? "Colleges";

  return (
    <>
      <PageHero
        accent="SVIT Group"
        title={`Our ${collegesLabel}`}
        subtitle="Four constituent institutes under one campus — engineering, computer applications, nursing, and architecture."
        crumbs={[{ label: "Home", to: "/" }, { label: collegesLabel }]}
      />
      <section className="container-page py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {colleges.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link
                href={`/colleges/${c.slug}`}
                className="card-lift group flex h-full flex-col rounded-2xl border border-border bg-white p-8"
              >
                <div className="flex items-start gap-5">
                  <CollegeLogo
                    shortCode={c.code}
                    src={c.logo_url ?? undefined}
                    className="h-20 w-20 shrink-0 rounded-md border border-border bg-secondary/50 p-2 text-navy"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.code}</div>
                    <h3 className="mt-1 font-display text-xl font-bold text-navy leading-tight">{c.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground italic">{c.tagline}</p>
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-gold">
                  Explore {c.code} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
