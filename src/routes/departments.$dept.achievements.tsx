import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { DeptAchievementsView } from "@/components/site/DepartmentSections";

const parent = getRouteApi("/departments/$dept");

export const Route = createFileRoute("/departments/$dept/achievements")({
  component: AchievementsRoute,
});

function AchievementsRoute() {
  const { department } = parent.useLoaderData();
  return <DeptAchievementsView department={department} />;
}
