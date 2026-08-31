import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptAboutView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode, getCoursesByDepartmentId } from "@/lib/departments.functions";

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
      department.about ??
      `Programs, faculty, achievements and industry engagement at the Department of ${department.name}, SVIT Vasad.`,
  };
}

export default async function DeptAboutPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const courses = await getCoursesByDepartmentId(department.id).catch(() => []);

  return <DeptAboutView department={department} courses={courses} />;
}
