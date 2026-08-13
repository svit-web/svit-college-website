import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminCrudManager } from '@/components/admin-next/AdminCrudManager';

export default async function AdminCollegesPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/colleges', level)) {
    redirect('/admin');
  }

  return <AdminCrudManager tableId="colleges" admin={admin} />;
}
