import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { engDepts } from "@/data/site";
import { Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/engineering/$dept")({
  loader: ({ params }) => {
    const dept = engDepts.find((d) => d.slug === params.dept);
    if (!dept) throw notFound();
    return { dept };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.dept.name} — SVIT Vasad` : "Department" }] }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1>Not found</h1></div>,
  component: DeptPage,
});

function DeptPage() {
  const { dept } = Route.useLoaderData();
  const others = engDepts.filter((d) => d.slug !== dept.slug);
  return (
    <>
      <PageHero title={dept.name} accent={`Engineering · ${dept.short}`} subtitle={dept.overview} crumbs={[{ label: "Home", to: "/" }, { label: "Engineering", to: "/courses/engineering" as any }, { label: dept.name }]} />

      <section className="container-page py-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Facilities" title="Labs & Facilities" />
            <ul className="mt-6 space-y-3">
              {dept.labs.map((l: string) => (
                <li key={l} className="flex items-start gap-3 rounded-md border border-border bg-white p-4">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
                  <span className="text-sm">{l}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Careers" title="Career Pathways" />
            <ul className="mt-6 space-y-3">
              {dept.careers.map((c: string) => (
                <li key={c} className="flex items-start gap-3 rounded-md border border-border bg-white p-4">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-crimson" />
                  <span className="text-sm">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-bold">Meet our {dept.short} faculty</h3>
            <p className="mt-1 text-sm text-white/80">Senior mentors driving research and teaching in {dept.name}.</p>
          </div>
          <Link to="/courses/engineering/$dept/faculty" params={{ dept: dept.slug }} className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-navy-deep hover:bg-gold-soft">
            <Users className="h-4 w-4" /> View Faculty
          </Link>
        </div>
      </section>

      <section className="bg-secondary/50 py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Explore More" title="Other Departments" />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((d) => (
              <Reveal key={d.slug}>
                <Link to="/courses/engineering/$dept" params={{ dept: d.slug }} className="card-lift group flex items-center gap-3 rounded-md border border-border bg-white p-4">
                  <div className={cn("h-9 w-9 shrink-0 rounded-md text-white flex items-center justify-center text-xs font-bold", d.color)}>{d.short}</div>
                  <div className="flex-1 text-sm font-semibold text-navy">{d.name}</div>
                  <ArrowRight className="h-4 w-4 text-navy transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
