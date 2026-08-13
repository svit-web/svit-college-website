import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/site-next/PageHero";
import { getCourseWithDept } from "@/lib/departments.functions";

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
  if (!course) return { title: "Program" };
  return { title: `${course.name} — SVIT Group` };
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
            href={`/departments/${dept.code}`}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold-strong"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {dept.name}
          </Link>
        )}
      </section>
    </>
  );
}
