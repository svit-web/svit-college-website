// Placeholder program-detail page. Links from department cards land here so
// the URL structure is stable while the real per-program content is authored.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CTABanner } from "@/components/site/CTABanner";
import {
  departments,
  programs as allPrograms,
  degreeTypes,
} from "@/data/academics";
import { collegeMap } from "@/data/colleges";
import { deptSlugOf } from "@/components/site/DepartmentDetailPage";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/departments/$dept/programs/$program")({
  loader: ({ params }) => {
    const dept = departments.find((d) => deptSlugOf(d.id) === params.dept);
    const program = allPrograms.find((p) => p.id === params.program);
    if (!dept || !program || program.departmentId !== dept.id) throw notFound();
    return { dept, program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Program not found" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.program.name} — SVIT Group` },
        { name: "description", content: `Program details for ${loaderData.program.name}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Program not found</h1>
    </div>
  ),
  component: ProgramPage,
});

function ProgramPage() {
  const { dept, program } = Route.useLoaderData();
  const college = collegeMap[dept.collegeId];
  const degreeType = dept.degreeTypeId
    ? degreeTypes.find((d) => d.id === dept.degreeTypeId)
    : null;
  return (
    <>
      <PageHero
        title={program.name}
        accent={`${college.shortCode}${degreeType ? ` · ${degreeType.name}` : ""} · ${dept.name}`}
        crumbs={[
          { label: "Home", to: "/" },
          { label: dept.name, to: "/departments/$dept" as never },
          { label: program.name },
        ]}
      />
      <section className="container-page py-16">
        <div className="rounded-2xl border-2 border-navy/15 bg-white p-8">
          <h2 className="font-display text-2xl font-bold text-navy">Program overview</h2>
          <p className="mt-3 text-muted-foreground">
            Detailed program information (curriculum, semesters, outcomes, fee structure) will be
            published here soon.
          </p>
          <Link
            to="/departments/$dept"
            params={{ dept: deptSlugOf(dept.id) }}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to department
          </Link>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
