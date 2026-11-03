import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MouCard } from "@/components/site-next/MouCard";
import { getAllDepartments, getDepartmentByCode } from "@/lib/departments.functions";
import { getDepartmentMOUs } from "@/lib/mous.functions";

// Same caching as the department's other tabs: see activities/page.tsx.
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
    title: `MoUs — Department of ${department.name} — SVIT Vasad`,
    description: `Memoranda of Understanding of the Department of ${department.name} at SVIT Vasad.`,
    alternates: { canonical: `/departments/${department.code}/mous` },
  };
}

export default async function DeptMousPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const mous = await getDepartmentMOUs(department.id).catch(() => []);
  // The tab only exists when there are MoUs, so this is a stale or typed URL.
  if (mous.length === 0) redirect(`/departments/${department.code}`);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mous.map((mou, i) => (
        <MouCard key={mou.id} mou={mou} delay={Math.min(i, 8) * 0.03} />
      ))}
    </div>
  );
}
