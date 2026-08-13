import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminStaffWizardsPage } from '@/components/admin-next/pages/AdminStaffWizardsPage';

export default async function StaffWizardsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/staff-wizards', level)) {
    redirect('/admin');
  }

  return <AdminStaffWizardsPage admin={admin} />;
}
