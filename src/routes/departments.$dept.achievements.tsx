import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptAchievementsView } from "@/components/site/DepartmentSections";
import { getDepartmentByCode } from "@/lib/departments.functions";
import { getAchievementsByDepartmentId, getClubsByDepartmentId } from "@/lib/department-content.functions";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/achievements")({
  loader: async ({ params }) => {
    const department = await getDepartmentByCode({ data: params.dept.toUpperCase() });
    if (!department) return { achievements: [], clubs: [] };
    const [achievements, clubs] = await Promise.all([
      getAchievementsByDepartmentId({ data: department.id }),
      getClubsByDepartmentId({ data: department.id }),
    ]);
    return { achievements, clubs };
  },
  component: AchievementsRoute,
});

function AchievementsRoute() {
  const { department } = parent.useLoaderData();
  const { achievements, clubs } = Route.useLoaderData();
  return <DeptAchievementsView department={department} achievements={achievements} clubs={clubs} />;
}
