import { createFileRoute, notFound } from "@tanstack/react-router";
import { DepartmentLayout } from "@/components/site/DepartmentLayout";
import { departments } from "@/data/academics";

export const Route = createFileRoute("/departments/$dept")({
  loader: ({ params }) => {
    const department = departments.find((d) => d.id === params.dept);
    if (!department) throw notFound();
    return { department };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Department not found" }, { name: "robots", content: "noindex" }] };
    const { department } = loaderData;
    const title = `${department.name} — SVIT Group`;
    const description = `Programs, faculty, achievements and industry activities at the Department of ${department.name}.`;
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
  component: DeptRoute,
  notFoundComponent: DeptNotFound,
});

function DeptRoute() {
  const { department } = Route.useLoaderData();
  return <DepartmentLayout department={department} />;
}

function DeptNotFound() {
  return (
    <div className="container-page py-32 text-center">
      <h1 className="font-display text-4xl font-bold text-navy">Department not found</h1>
      <p className="mt-3 text-muted-foreground">The department you're looking for doesn't exist.</p>
    </div>
  );
}
