import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptActivitiesView } from "@/components/site/DepartmentSections";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/activities")({
  component: ActivitiesRoute,
});

function ActivitiesRoute() {
  const { department } = parent.useLoaderData();
  return <DeptActivitiesView department={department} />;
}
