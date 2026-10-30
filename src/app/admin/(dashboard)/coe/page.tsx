import { redirect } from "next/navigation";
import { requireAdmin, getScopeLevel } from "@/app/lib/auth/admin";
import { isRouteAllowedForUser } from "@/lib/admin-sections";
import { AdminCenterPageMount } from "@/components/admin-next/pages/AdminCenterPageMount";

export default async function CoeAdminPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (
    !isRouteAllowedForUser(
      "/admin/coe",
      level,
      admin.sections.map((s) => s.code),
    )
  ) {
    redirect("/admin");
  }

  return <AdminCenterPageMount page="coe" />;
}
