import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DepartmentLayout } from "@/components/site-next/DepartmentLayout";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getCollegesGrid } from "@/lib/homepage.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) {
    return { title: "Department not found", robots: { index: false } };
  }
  const title = `${department.name} — SVIT Group`;
  const description = `Programs, faculty, achievements and industry activities at the Department of ${department.name}.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image" },
  };
}

export default async function DeptLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const [department, colleges] = await Promise.all([
    getDepartmentByCode(dept.toUpperCase()).catch(() => null),
    getCollegesGrid().catch(() => []),
  ]);
  if (!department) notFound();

  const college = colleges.find((c) => c.slug === department.college_slug) ?? null;

  return (
    <DepartmentLayout department={department} college={college}>
      {children}
    </DepartmentLayout>
  );
}
