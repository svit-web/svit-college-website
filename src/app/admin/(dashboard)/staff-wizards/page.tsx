import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminStaffWizardsPage } from '@/components/admin-next/pages/AdminStaffWizardsPage';

export default async function StaffWizardsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/staff-wizards', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminStaffWizardsPage admin={admin} />;
}
