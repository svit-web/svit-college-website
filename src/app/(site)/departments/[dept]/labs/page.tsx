import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptLabsView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getLabsByDepartmentId } from "@/lib/facilities.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) return { title: "Department" };
  return {
    title: `Labs & Facilities — Department of ${department.name} — SVIT Vasad`,
    description: `Laboratories and facilities in the Department of ${department.name} at SVIT Vasad.`,
  };
}

export default async function DeptLabsPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const labs = await getLabsByDepartmentId(department.id).catch(() => []);

  return <DeptLabsView department={department} labs={labs} />;
}
