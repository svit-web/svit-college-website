import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import { getEngDeptBySlug } from "@/lib/programmes.functions";

/**
 * Legacy route: /courses/engineering/$dept/faculty
 * Redirects to /departments/$dept (faculty section lives there now).
 */
export const Route = createFileRoute("/courses/engineering/$dept/faculty")({
  loader: async ({ params }) => {
    const dept = await getEngDeptBySlug({ data: params.dept });
    if (!dept) throw notFound();
    throw redirect({ to: "/departments/$dept", params: { dept: dept.code }, replace: true });
  },
  component: () => null,
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Page not found</h1>
    </div>
  ),
});
