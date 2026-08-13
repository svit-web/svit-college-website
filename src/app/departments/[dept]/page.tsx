import { notFound } from "next/navigation";
import { DeptAboutView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode, getCoursesByDepartmentId } from "@/lib/departments.functions";

export default async function DeptAboutPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const courses = await getCoursesByDepartmentId(department.id).catch(() => []);

  return <DeptAboutView department={department} courses={courses} />;
}
