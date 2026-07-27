import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptStaffView } from "@/components/site/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getStaffByDepartmentId } from "@/lib/department-content.functions";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/staff")({
  loader: async ({ params }) => {
    const department = await getDepartmentByCode({ data: params.dept.toUpperCase() });
    if (!department) return { staff: [] };
    const staff = await getStaffByDepartmentId({ data: department.id });
    return { staff };
  },
  component: StaffRoute,
});

function StaffRoute() {
  const { department } = parent.useLoaderData();
  const { staff } = Route.useLoaderData();
  return <DeptStaffView department={department} staff={staff} />;
}
