import { notFound, redirect } from "next/navigation";
import { getEngDeptBySlug } from "@/lib/programmes.functions";

/**
 * Legacy route: /courses/engineering/[dept]
 * Redirects to the canonical /departments/[dept] URL using the department code.
 * Kept for backwards compatibility with old links/bookmarks.
 */
export default async function EngineeringDeptRedirect({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept: slug } = await params;
  const dept = await getEngDeptBySlug(slug).catch(() => null);
  if (!dept) notFound();
  redirect(`/departments/${dept.code}`);
}
