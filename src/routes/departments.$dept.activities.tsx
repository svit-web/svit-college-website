import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptActivitiesView } from "@/components/site/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getDepartmentActivities } from "@/lib/department-content.functions";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/activities")({
  loader: async ({ params }) => {
    const department = await getDepartmentByCode({ data: params.dept.toUpperCase() });
    if (!department) return { activities: [] };
    const activities = await getDepartmentActivities({ data: department.id });
    return { activities };
  },
  component: ActivitiesRoute,
});

function ActivitiesRoute() {
  const { department } = parent.useLoaderData();
  const { activities } = Route.useLoaderData();
  return <DeptActivitiesView department={department} activities={activities} />;
}
