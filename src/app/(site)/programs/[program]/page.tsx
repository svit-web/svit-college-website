import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/site-next/PageHero";
import { getCourseWithDept } from "@/lib/departments.functions";

// NOTE: `revalidate` alone does nothing on a dynamic-segment page — verified
// empirically (Cache-Control came back `no-store` without a matching
// generateStaticParams; see PERFORMANCE_REPORT.md). It's left set here for
// when generateStaticParams is added, but is NOT currently caching this
// route. Deliberately deferred: getCourseWithDept looks up by id, and there's
// no existing flat "every course id" function — enumerating them means a new
// aggregate query across every department's courses plus top-level
// programmes. Worth doing, but as its own reviewed change, not folded into
// this pass. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

const DEGREE_LABEL: Record<string, string> = {
  undergraduate: "Undergraduate (UG)",
  graduate: "Postgraduate (PG)",
  certificate: "Diploma",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ program: string }>;
}): Promise<Metadata> {
  const { program } = await params;
  const course = await getCourseWithDept(program).catch(() => null);
  if (!course) return { title: "Program", robots: { index: false } };
  const level = course.degree_level ? DEGREE_LABEL[course.degree_level] : null;
  return {
    title: `${course.name} — SVIT Group`,
    description: [
      `${course.name}${level ? ` — ${level}` : ""}`,
      course.dept ? ` offered by the Department of ${course.dept.name}` : "",
      " at SVIT Vasad.",
    ].join(""),
    alternates: { canonical: `/programs/${course.id}` },
  };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ program: string }>;
}) {
  const { program } = await params;
  const course = await getCourseWithDept(program).catch(() => null);
  if (!course) notFound();

  const { dept } = course;
  return (
    <>
      <PageHero
        title={course.short_name ?? course.name}
        accent={dept ? dept.name : "Program"}
        crumbs={[
          { label: "Home", to: "/" },
          ...(dept ? [{ label: dept.name, to: `/departments/${dept.code}` }] : []),
          { label: course.short_name ?? course.name },
        ]}
      />
      <section className="container-page py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "Degree Level", v: DEGREE_LABEL[course.degree_level] ?? course.degree_level },
            { k: "Year Started", v: course.year_started ? String(course.year_started) : "—" },
            { k: "Intake", v: course.intake ? String(course.intake) : "—" },
            { k: "Duration", v: course.duration_years ? `${course.duration_years} years` : "—" },
          ].map((s) => (
            <div key={s.k} className="border border-line bg-surface p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-crimson">{s.k}</div>
              <div className="mt-2 font-display text-2xl font-medium text-navy">{s.v}</div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-ink-soft">
          Full program details — curriculum, eligibility, fees, career pathways and admission process — will be
          published here.
        </p>
        {dept && (
          <Link
            href={`/departments/${dept.code}`}
            className="mt-5 inline-flex items-center gap-2 py-1.5 text-sm font-semibold text-navy hover:text-crimson"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {dept.name}
          </Link>
        )}
      </section>
    </>
  );
}
