import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminMenusPage } from '@/components/admin-next/pages/AdminMenusPage';

export default async function MenusPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/menus', level)) {
    redirect('/admin');
  }

  return <AdminMenusPage admin={admin} />;
}
