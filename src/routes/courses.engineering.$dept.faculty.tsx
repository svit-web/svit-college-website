import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CTABanner } from "@/components/site/CTABanner";
import { FacultyGrid } from "@/components/site/FacultyGrid";
import { getEngDeptBySlug } from "@/lib/programmes.functions";
import { getFaculty } from "@/lib/faculty";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/courses/engineering/$dept/faculty")({
  loader: async ({ params }) => {
    const dept = await getEngDeptBySlug({ data: params.dept });
    if (!dept) throw notFound();
    return { dept };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.dept.name} Faculty` : "Faculty" }] }),
  notFoundComponent: () => <div className="container-page py-32 text-center"><h1>Not found</h1></div>,
  component: DeptFacultyPage,
});

function DeptFacultyPage() {
  const { dept } = Route.useLoaderData();
  const m = dept.metadata;
  const faculty = getFaculty(m.engSlug, m.careers.concat(m.labs), 9);
  return (
    <>
      <PageHero title={`${dept.name} Faculty`} accent={m.short} crumbs={[{ label: "Home", to: "/" }, { label: "Engineering" }, { label: dept.name, to: "/courses/engineering/$dept" }, { label: "Faculty" }]} />
      <section className="container-page py-20">
        <SectionHeading center eyebrow="Meet the Team" title={`${dept.name} Mentors`} />
        <div className="mt-12"><FacultyGrid members={faculty} /></div>
        <div className="mt-10 text-center">
          <Link to="/courses/engineering/$dept" params={{ dept: m.engSlug }} className="inline-flex items-center gap-1 text-sm text-navy hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Back to {dept.name}
          </Link>
        </div>
      </section>
      <CTABanner />
    </>
  );
}
