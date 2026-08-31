import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptAchievementsView } from "@/components/site-next/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import {
  getAchievementsByDepartmentId,
  getClubsByDepartmentId,
} from "@/lib/department-content.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) return { title: "Department" };
  return {
    title: `Achievements & Clubs — Department of ${department.name} — SVIT Vasad`,
    description: `Student achievements and clubs from the Department of ${department.name} at SVIT Vasad.`,
  };
}

export default async function DeptAchievementsPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const [achievements, clubs] = await Promise.all([
    getAchievementsByDepartmentId(department.id).catch(() => []),
    getClubsByDepartmentId(department.id).catch(() => []),
  ]);

  return <DeptAchievementsView department={department} achievements={achievements} clubs={clubs} />;
}
