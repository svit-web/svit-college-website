import { notFound } from "next/navigation";
import { DeptLabsView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getLabsByDepartmentId } from "@/lib/facilities.functions";

export default async function DeptLabsPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const labs = await getLabsByDepartmentId(department.id).catch(() => []);

  return <DeptLabsView department={department} labs={labs} />;
}
