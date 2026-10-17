import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptAboutView } from "@/components/site-next/DepartmentSections";
import { getAllDepartments, getDepartmentByCode, getCoursesByDepartmentId } from "@/lib/departments.functions";
import { metaDescription } from "@/lib/seo";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

export async function generateStaticParams() {
  const departments = await getAllDepartments().catch(() => []);
  return departments.map((d) => ({ dept: d.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) return { title: "Department" };
  return {
    title: `Department of ${department.name} — SVIT Vasad`,
    description:
      metaDescription(department.about) ??
      `Programs, faculty, achievements and industry engagement at the Department of ${department.name}, SVIT Vasad.`,
    alternates: { canonical: `/departments/${department.code}` },
  };
}

export default async function DeptAboutPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const courses = await getCoursesByDepartmentId(department.id).catch(() => []);

  return <DeptAboutView department={department} courses={courses} />;
}
