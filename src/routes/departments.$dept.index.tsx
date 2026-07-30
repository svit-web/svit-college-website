import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptAboutView } from "@/components/site/DepartmentSections";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/")({
  component: AboutRoute,
});

function AboutRoute() {
  const { department, courses, labs } = parent.useLoaderData();
  return <DeptAboutView department={department} courses={courses} labs={labs} />;
}
