import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptLabsView } from "@/components/site/DepartmentSections";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/labs")({
  component: LabsRoute,
});

function LabsRoute() {
  const { department, labs } = parent.useLoaderData();
  return <DeptLabsView department={department} labs={labs} />;
}
