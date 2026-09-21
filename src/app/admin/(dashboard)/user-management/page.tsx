import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminUserManagementPage } from '@/components/admin-next/pages/AdminUserManagementPage';

export default async function UserManagementPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/user-management', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminUserManagementPage />;
}
