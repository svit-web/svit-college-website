import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminTrashPage } from '@/components/admin-next/pages/AdminTrashPage';

export default async function TrashPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/trash', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminTrashPage admin={admin} />;
}
