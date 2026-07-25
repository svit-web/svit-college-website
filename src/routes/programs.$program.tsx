import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { getCourseWithDept } from "@/lib/departments.functions";

const DEGREE_LABEL: Record<string, string> = {
  undergraduate: "Undergraduate (UG)",
  graduate: "Postgraduate (PG)",
  certificate: "Diploma",
};

export const Route = createFileRoute("/programs/$program")({
  loader: async ({ params }) => {
    const course = await getCourseWithDept({ data: params.program });
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.course.name} — SVIT Group` : "Program" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Program not found</h1>
    </div>
  ),
  component: ProgramPage,
});

function ProgramPage() {
  const { course } = Route.useLoaderData();
  const { dept } = course;
  return (
    <>
      <PageHero
        title={course.metadata?.shortName ?? course.name}
        accent={dept ? dept.name : "Program"}
        crumbs={[
          { label: "Home", to: "/" },
          ...(dept ? [{ label: dept.name, to: `/departments/${dept.code}` }] : []),
          { label: course.metadata?.shortName ?? course.name },
        ]}
      />
      <section className="container-page py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Degree Level", v: DEGREE_LABEL[course.degree_level] ?? course.degree_level },
            { k: "Year Started", v: course.metadata?.yearStarted ? String(course.metadata.yearStarted) : "—" },
            { k: "Intake", v: course.metadata?.intake ? String(course.metadata.intake) : "—" },
            { k: "Duration", v: course.metadata?.durationYears ? `${course.metadata.durationYears} years` : "—" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border-2 border-navy/15 bg-white p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-crimson">{s.k}</div>
              <div className="mt-2 font-display text-2xl font-bold text-navy">{s.v}</div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          Full program details — curriculum, eligibility, fees, career pathways and admission process — will be
          published here.
        </p>
        {dept && (
          <Link
            to="/departments/$dept"
            params={{ dept: dept.code }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-strong"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {dept.name}
          </Link>
        )}
      </section>
    </>
  );
}
