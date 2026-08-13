import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminUserManagementPage } from '@/components/admin-next/pages/AdminUserManagementPage';

export default async function UserManagementPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/user-management', level)) {
    redirect('/admin');
  }

  return <AdminUserManagementPage />;
}
