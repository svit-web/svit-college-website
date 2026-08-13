import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site-next/PageHero";
import { PillTabs } from "@/components/site-next/PillTabs";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getAllCenters } from "@/lib/centers.functions";

export const metadata: Metadata = {
  title: "Societies — SVIT Vasad",
  description: "Student, faculty and innovation centres at SVIT Vasad.",
};

export default async function StudentCornerIndex() {
  const centers = await getAllCenters().catch(() => []);

  return (
    <>
      <PageHero
        title="Societies"
        accent="Beyond the Classroom"
        subtitle="Centres, cells and chapters where students grow beyond the syllabus."
        crumbs={[{ label: "Home", to: "/" }, { label: "Societies" }]}
      />

      <section className="container-page py-20">
        <PillTabs
          ariaLabel="Centres"
          items={centers.map((c) => ({ label: c.name.split("(")[0].trim(), to: `/student-corner/${c.slug}` }))}
        />
        <SectionHeading eyebrow="Centres" title="Where students grow beyond the syllabus" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <Link
                href={`/student-corner/${c.slug}`}
                className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">
                  {c.accent_color || "Centre"}
                </div>
                <h4 className="mt-1 font-display font-bold text-navy">{c.name}</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.subtitle || ""}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
