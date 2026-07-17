import { createFileRoute, Link } from "@tanstack/react-router";
import { PillTabs } from "@/components/site/PillTabs";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { centreDetails } from "@/data/campus-rfe";

export const Route = createFileRoute("/campus-life/centre/")({
  head: () => ({
    meta: [
      { title: "Co-curricular Centres — SVIT Vasad" },
      { name: "description", content: "Student, faculty and innovation centres at SVIT Vasad." },
    ],
  }),
  component: CentresIndex,
});

function CentresIndex() {
  return (
    <div>
      <PillTabs
        ariaLabel="Centres"
        items={centreDetails.map((c) => ({ label: c.title.split("(")[0].trim(), to: `/campus-life/centre/${c.slug}` }))}
      />
      <SectionHeading eyebrow="Centres" title="Where students grow beyond the syllabus" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {centreDetails.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.03}>
            <Link
              to="/campus-life/centre/$slug"
              params={{ slug: c.slug }}
              className="card-lift block h-full rounded-2xl border-2 border-navy/15 bg-white p-5 hover:border-gold"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-crimson">{c.accent}</div>
              <h4 className="mt-1 font-display font-bold text-navy">{c.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{c.subtitle}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
