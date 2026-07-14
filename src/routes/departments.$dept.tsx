import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  DepartmentDetailPage,
  findDepartmentBySlug,
} from "@/components/site/DepartmentDetailPage";

export const Route = createFileRoute("/departments/$dept")({
  loader: ({ params }) => {
    const dept = findDepartmentBySlug(params.dept);
    if (!dept) throw notFound();
    return { dept };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Department not found — SVIT Group" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { dept } = loaderData;
    const title = `${dept.name} — SVIT Group`;
    const description = `Department of ${dept.name}: programs offered, faculty & staff, achievements, and industry activities.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Department not found</h1>
      <p className="mt-3 text-muted-foreground">
        The department you're looking for doesn't exist.
      </p>
    </div>
  ),
  component: DeptPage,
});

function DeptPage() {
  const { dept } = Route.useLoaderData();
  return <DepartmentDetailPage dept={dept} />;
}
