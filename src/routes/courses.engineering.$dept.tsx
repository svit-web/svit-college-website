import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import { getEngDeptBySlug } from "@/lib/programmes.functions";

/**
 * Legacy route: /courses/engineering/$dept
 * Redirects to the canonical /departments/$dept URL using the department code.
 * Kept for backwards compatibility with old links/bookmarks.
 */
export const Route = createFileRoute("/courses/engineering/$dept")({
  loader: async ({ params }) => {
    const dept = await getEngDeptBySlug({ data: params.dept });
    if (!dept) throw notFound();
    throw redirect({ to: "/departments/$dept", params: { dept: dept.code }, replace: true });
  },
  component: () => null,
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Department not found</h1>
    </div>
  ),
});
