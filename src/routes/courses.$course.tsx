import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { getProgrammeBySlug, getEngDepts } from "@/lib/programmes.functions";
import { getAllRecruiters } from "@/lib/placement.functions";
import { Check, Users, FileText, ClipboardList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/$course")({
  loader: async ({ params }) => {
    const [programme, engDepts, recruitersData] = await Promise.all([
      getProgrammeBySlug({ data: params.course }),
      getEngDepts(),
      getAllRecruiters(),
    ]);
    if (!programme) throw notFound();
    return { course: programme, engDepts, recruiters: recruitersData.map((r) => r.company_name) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.course.name} — SVIT Vasad` : "Course — SVIT Vasad" },
      { name: "description", content: loaderData?.course.metadata.description ?? "Course details" },
    ],
  }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1 className="font-display text-3xl font-bold text-navy">Course not found</h1></div>,
  component: CoursePage,
});

function CoursePage() {
  const { course, engDepts, recruiters } = Route.useLoaderData();
  const isEng = course.code === "engineering";
  const m = course.metadata;
  return (
    <>
      <PageHero title={course.name} accent={m.tagline} subtitle={m.description} crumbs={[{ label: "Home", to: "/" }, { label: "Courses", to: "/courses" }, { label: course.name }]} />

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
                <div><dt className="text-white/60 text-xs">Full Name</dt><dd>{m.fullName}</dd></div>
                <div><dt className="text-white/60 text-xs">Duration</dt><dd>{m.duration}</dd></div>
                <div><dt className="text-white/60 text-xs">Eligibility</dt><dd>{m.eligibility}</dd></div>
                <div><dt className="text-white/60 text-xs">Intake</dt><dd>{m.intake}</dd></div>
              </dl>
              <Link to="/admissions/inquiry" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft">
                Apply Now
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h4 className="font-display font-bold text-navy">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/courses/$course/faculty" params={{ course: course.code }} className="flex items-center gap-2 text-navy hover:text-gold"><Users className="h-4 w-4" /> Faculty</Link></li>
                <li><Link to="/downloads" className="flex items-center gap-2 text-navy hover:text-gold"><FileText className="h-4 w-4" /> Syllabus</Link></li>
                <li><Link to="/admissions" className="flex items-center gap-2 text-navy hover:text-gold"><ClipboardList className="h-4 w-4" /> Admissions</Link></li>
                <li><Link to="/news" className="flex items-center gap-2 text-navy hover:text-gold"><Calendar className="h-4 w-4" /> News</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {isEng && (
        <section className="bg-secondary/50 py-20">
          <div className="container-page">
            <SectionHeading center eyebrow="Engineering Departments" title="Specialised Branches" />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {engDepts.map((d, i) => (
                <Reveal key={d.code} delay={i * 0.03}>
                  <Link to="/courses/engineering/$dept" params={{ dept: d.metadata.engSlug }} className="card-lift group flex h-full flex-col rounded-2xl border border-border bg-white p-6">
                    <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-md text-white text-xs font-bold", d.metadata.color)}>{d.metadata.short}</div>
                    <h4 className="font-display font-bold text-navy">{d.name}</h4>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{d.metadata.overview}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page py-20">
        <SectionHeading center eyebrow="Recruiters" title="Where our graduates go" />
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {recruiters.map((r) => (
            <span key={r} className="font-display text-xl font-bold text-navy/50 hover:text-navy transition-colors">{r}</span>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
