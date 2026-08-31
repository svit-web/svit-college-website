import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptActivitiesView } from "@/components/site-next/DeptActivitiesView";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getDepartmentActivities } from "@/lib/department-content.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) return { title: "Department" };
  return {
    title: `Industry Interaction & Activities — Department of ${department.name} — SVIT Vasad`,
    description: `Industry interaction and departmental activities from the Department of ${department.name} at SVIT Vasad.`,
  };
}

export default async function DeptActivitiesPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const activities = await getDepartmentActivities(department.id).catch(() => []);

  return <DeptActivitiesView activities={activities} />;
}
