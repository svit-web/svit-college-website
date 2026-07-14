import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptStaffView } from "@/components/site/DepartmentSections";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/staff")({
  component: StaffRoute,
});

function StaffRoute() {
  const { department } = parent.useLoaderData();
  return <DeptStaffView department={department} />;
}
