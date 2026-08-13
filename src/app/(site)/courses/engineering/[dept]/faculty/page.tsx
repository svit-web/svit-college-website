import { notFound, redirect } from "next/navigation";
import { getEngDeptBySlug } from "@/lib/programmes.functions";

/**
 * Legacy route: /courses/engineering/[dept]/faculty
 * Redirects to /departments/[dept] (faculty section lives there now).
 */
export default async function EngineeringDeptFacultyRedirect({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept: slug } = await params;
  const dept = await getEngDeptBySlug(slug).catch(() => null);
  if (!dept) notFound();
  redirect(`/departments/${dept.code}`);
}
