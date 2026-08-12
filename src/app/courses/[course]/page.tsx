import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/site-next/PageHero";
import { SectionHeading } from "@/components/site-next/SectionHeading";
import { getProgrammeBySlug } from "@/lib/programmes.functions";
import { getAllRecruiters, type Recruiter } from "@/lib/placement.functions";
import { Check, FileText, ClipboardList, Calendar } from "lucide-react";

async function loadCourse(slug: string) {
  const programme = await getProgrammeBySlug(slug);
  if (!programme) return null;
  const recruitersData = await getAllRecruiters();
  return { course: programme, recruiters: recruitersData.map((r: Recruiter) => r.company_name) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}): Promise<Metadata> {
  const { course: slug } = await params;
  const result = await loadCourse(slug);
  if (!result) return { title: "Course — SVIT Vasad" };
  return {
    title: `${result.course.name} — SVIT Vasad`,
    description: result.course.description ?? "Course details",
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course: slug } = await params;
  const result = await loadCourse(slug);
  if (!result) notFound();

  const { course, recruiters } = result;
  const m = course.metadata;

  return (
    <>
      <PageHero title={course.name} accent={course.tagline} subtitle={course.description} crumbs={[{ label: "Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: course.name }]} />

      <section className="container-page py-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            <div>
              <SectionHeading eyebrow="Programme Highlights" title="What makes it different" />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {m.highlights.map((h: string) => (
                  <li key={h} className="flex items-start gap-3 rounded-md border border-border bg-white p-4">
                    <Check className="mt-0.5 h-4 w-4 text-gold shrink-0" />
                    <span className="text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading eyebrow="Outcomes" title="Learning outcomes" />
              <ul className="mt-8 space-y-3">
                {m.outcomes.map((o: string) => (
                  <li key={o} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-crimson shrink-0" />
                    <span className="text-sm text-muted-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">At a glance</div>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-white/60 text-xs">Full Name</dt><dd>{course.full_name}</dd></div>
                <div><dt className="text-white/60 text-xs">Duration</dt><dd>{course.duration}</dd></div>
                <div><dt className="text-white/60 text-xs">Eligibility</dt><dd>{course.eligibility}</dd></div>
                <div><dt className="text-white/60 text-xs">Intake</dt><dd>{String(course.intake ?? "—")}</dd></div>
              </dl>
              <Link href="/admissions/inquiry" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft">
                Apply Now
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h4 className="font-display font-bold text-navy">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/downloads" className="flex items-center gap-2 text-navy hover:text-gold"><FileText className="h-4 w-4" /> Syllabus</Link></li>
                <li><Link href="/admissions" className="flex items-center gap-2 text-navy hover:text-gold"><ClipboardList className="h-4 w-4" /> Admissions</Link></li>
                <li><Link href="/news" className="flex items-center gap-2 text-navy hover:text-gold"><Calendar className="h-4 w-4" /> News</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Recruiters" title="Where our graduates go" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {recruiters.map((r) => (
            <span key={r} className="font-display text-xl font-bold text-navy/50 hover:text-navy transition-colors">{r}</span>
          ))}
        </div>
      </section>
    </>
  );
}
