import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptLabsView } from "@/components/site-next/DepartmentSections";
import {
  getAllDepartments,
  getDepartmentByCode,
  getInheritedCollegeId,
} from "@/lib/departments.functions";
import { getCollegeFacilities, getLabsByDepartmentId } from "@/lib/facilities.functions";
import { getEntryAlbums } from "@/lib/gallery.functions";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
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
    title: `Labs & Facilities — Department of ${department.name} — SVIT Vasad`,
    description: `Laboratories and facilities in the Department of ${department.name} at SVIT Vasad.`,
    alternates: { canonical: `/departments/${department.code}/labs` },
  };
}

export default async function DeptLabsPage({ params }: { params: Promise<{ dept: string }> }) {
  const { dept } = await params;
  const department = await getDepartmentByCode(dept.toUpperCase()).catch(() => null);
  if (!department) notFound();

  const collegeId = await getInheritedCollegeId(department.college_id).catch(() => null);
  const [labs, collegeFacilities] = await Promise.all([
    getLabsByDepartmentId(department.id).catch(() => []),
    collegeId ? getCollegeFacilities(collegeId).catch(() => []) : [],
  ]);
  const labAlbums = await getEntryAlbums([...labs, ...collegeFacilities].map((l) => l.album_id));

  return (
    <DeptLabsView
      department={department}
      labs={labs}
      collegeFacilities={collegeFacilities}
      labAlbums={labAlbums}
    />
  );
}
