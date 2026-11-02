import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site-next/PageHero";
import { Reveal } from "@/components/site-next/Reveal";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getAllProgrammes, type Programme } from "@/lib/programmes.functions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Courses — SVIT Vasad",
  description: "Explore engineering, MBA, MCA, BBA, B.Sc, architecture and diploma programmes at SVIT Vasad.",
  alternates: { canonical: "/courses" },
};

// Stored as the degree_level enum, where 'graduate' means postgraduate and
// 'certificate' covers the diplomas.
const LEVELS: { level: Programme["degree_level"]; id: string; title: string }[] = [
  { level: "undergraduate", id: "undergraduate", title: "Undergraduate" },
  { level: "graduate", id: "postgraduate", title: "Postgraduate" },
  { level: "certificate", id: "diploma", title: "Diploma" },
  { level: "doctorate", id: "doctorate", title: "Doctorate" },
];

function ProgrammeCard({ programme: c }: { programme: Programme }) {
  return (
    <Link
      href={`/courses/${c.code}`}
      className="group flex h-full flex-col border border-line bg-surface p-7 hover:border-navy"
    >
      <div className="flex items-center gap-4">
        {/* Admin theme colour as an accent bar — white text on e.g. bg-gold is unreadable. */}
        <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden border border-line bg-paper-deep font-display text-sm font-medium text-navy">
          <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1", c.color)} />
          {c.short_name}
        </div>
        <div>
          <h3 className="font-display text-xl font-medium text-navy">{c.name}</h3>
          <div className="text-xs font-semibold uppercase tracking-wider text-crimson">{c.tagline}</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-ink-soft">{c.full_name}</div>
      {c.description && <p className="mt-3 text-sm text-ink-soft line-clamp-3">{c.description}</p>}
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-xs">
        <div><dt className="text-ink-soft">Duration</dt><dd className="font-semibold text-navy">{c.duration ?? "—"}</dd></div>
        <div><dt className="text-ink-soft">Intake</dt><dd className="font-semibold text-navy">{String(c.intake ?? "—")}</dd></div>
        <div><dt className="text-ink-soft">Eligibility</dt><dd className="font-semibold text-navy text-xs leading-tight">{c.eligibility ?? "—"}</dd></div>
      </dl>
      <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-navy group-hover:text-crimson">
        View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default async function CoursesIndex() {
  const programmes = await getAllProgrammes().catch(() => []);
  const sections = LEVELS.map((level) => ({
    ...level,
    programmes: programmes.filter((p) => p.degree_level === level.level),
  })).filter((section) => section.programmes.length > 0);

  return (
    <>
      <PageHero title="Our Courses" accent="Programmes" subtitle="Undergraduate, postgraduate and diploma programmes designed to build careers." crumbs={[{ label: "Home", to: "/" }, { label: "Courses" }]} />

      <div className="container-page space-y-16 py-20">
        {sections.map((section) => (
          <section key={section.level} id={section.id} className="scroll-mt-24">
            <SectionHeading
              eyebrow={`${section.programmes.length} ${section.programmes.length === 1 ? "Programme" : "Programmes"}`}
              title={section.title}
              variant="eyebrow"
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.programmes.map((c, i) => (
                <Reveal key={c.code} delay={i * 0.05}>
                  <ProgrammeCard programme={c} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
