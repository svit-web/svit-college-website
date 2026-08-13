import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminTrashPage } from '@/components/admin-next/pages/AdminTrashPage';

export default async function TrashPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/trash', level)) {
    redirect('/admin');
  }

  return <AdminTrashPage admin={admin} />;
}
