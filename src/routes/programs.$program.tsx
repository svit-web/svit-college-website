import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { programs, departments } from "@/data/academics";
import { getProgramDetail } from "@/data/programDetails";
import { collegeMap } from "@/data/colleges";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/programs/$program")({
  loader: ({ params }) => {
    const program = programs.find((p) => p.id === params.program);
    if (!program) throw notFound();
    const department = departments.find((d) => d.id === program.departmentId) ?? null;
    return { program, department };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.program.name} — SVIT Group` : "Program" }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Program not found</h1>
    </div>
  ),
  component: ProgramPage,
});

function ProgramPage() {
  const { program, department } = Route.useLoaderData();
  const detail = getProgramDetail(program.id);
  const college = department ? collegeMap[department.collegeId as keyof typeof collegeMap] : null;
  return (
    <>
      <PageHero
        title={program.name}
        accent={department ? department.name : "Program"}
        crumbs={[
          { label: "Home", to: "/" },
          ...(college ? [{ label: college.shortCode, to: college.route }] : []),
          ...(department ? [{ label: department.name, to: "/departments/$dept" }] : []),
          { label: program.name },
        ]}
      />
      <section className="container-page py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Degree Level", v: detail.degreeLevel },
            { k: "Year Started", v: detail.yearStarted ?? "—" },
            { k: "Intake", v: detail.intake ?? "—" },
            { k: "Duration", v: detail.durationYears ? `${detail.durationYears} years` : "—" },
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
        {department && (
          <Link
            to="/departments/$dept"
            params={{ dept: department.id }}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-strong"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {department.name}
          </Link>
        )}
      </section>
    </>
  );
}
