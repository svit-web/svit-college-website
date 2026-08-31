import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptStaffView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getStaffByDepartmentId } from "@/lib/department-content.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) return { title: "Department" };
  return {
    title: `Faculty — Department of ${department.name} — SVIT Vasad`,
    description: `Meet the faculty of the Department of ${department.name} at SVIT Vasad.`,
  };
}

export default async function DeptStaffPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const staff = await getStaffByDepartmentId(department.id).catch(() => []);

  return <DeptStaffView department={department} staff={staff} />;
}
