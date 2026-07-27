import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptAchievementsView } from "@/components/site/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getAchievementsByDepartmentId } from "@/lib/department-content.functions";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/achievements")({
  loader: async ({ params }) => {
    const department = await getDepartmentByCode({ data: params.dept.toUpperCase() });
    if (!department) return { achievements: [] };
    const achievements = await getAchievementsByDepartmentId({ data: department.id });
    return { achievements };
  },
  component: AchievementsRoute,
});

function AchievementsRoute() {
  const { department } = parent.useLoaderData();
  const { achievements } = Route.useLoaderData();
  return <DeptAchievementsView department={department} achievements={achievements} />;
}
