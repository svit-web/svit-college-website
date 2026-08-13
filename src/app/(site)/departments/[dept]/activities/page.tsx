import { notFound } from "next/navigation";
import { DeptActivitiesView } from "@/components/site-next/DeptActivitiesView";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getDepartmentActivities } from "@/lib/department-content.functions";

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
