import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CTABanner } from "@/components/site/CTABanner";
import { Reveal } from "@/components/site/Reveal";
import { courses as staticCourses } from "@/data/site";
import { useSupabaseCourses } from "@/hooks/useSupabaseData";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/")({
  head: () => ({ meta: [{ title: "Our Courses — SVIT Vasad" }, { name: "description", content: "Explore engineering, MBA, MCA, BBA, B.Sc, architecture and diploma programmes at SVIT Vasad." }] }),
  component: CoursesIndex,
});

function CoursesIndex() {
  const { data: coursesData } = useSupabaseCourses();
  const courseList = coursesData && coursesData.length > 0 ? coursesData : staticCourses;

  return (
    <>
      <PageHero title="Our Courses" accent="Programmes" subtitle="Seven programmes designed to build careers, from undergraduate engineering to postgraduate management." crumbs={[{ label: "Home", to: "/" }, { label: "Courses" }]} />

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseList.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.05}>
              <Link
                to="/courses/$course"
                params={{ course: c.slug }}
                className="card-lift group flex h-full flex-col rounded-2xl border-2 border-navy/15 bg-white p-7 hover:border-gold"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-md text-white font-display font-bold text-sm", c.color)}>
                    {c.short}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-navy">{c.name}</h3>
                    <div className="text-xs font-semibold uppercase tracking-wider text-crimson">{c.tagline}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">{c.fullName}</div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{c.description}</p>
                <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
                  <div><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold text-navy">{c.duration}</dd></div>
                  <div><dt className="text-muted-foreground">Intake</dt><dd className="font-semibold text-navy">{c.intake}</dd></div>
                  <div><dt className="text-muted-foreground">Eligibility</dt><dd className="font-semibold text-navy text-[10px] leading-tight">{c.eligibility}</dd></div>
                </dl>
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-navy group-hover:text-gold">
                  View Details <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CTABanner />
    </>
  );
}
