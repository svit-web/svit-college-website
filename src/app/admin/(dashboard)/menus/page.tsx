import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminMenusPage } from '@/components/admin-next/pages/AdminMenusPage';

export default async function MenusPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/menus', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminMenusPage admin={admin} />;
}
