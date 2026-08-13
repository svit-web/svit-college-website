import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminMediaPage } from '@/components/admin-next/pages/AdminMediaPage';

export default async function MediaPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/media', level)) {
    redirect('/admin');
  }

  return <AdminMediaPage admin={admin} />;
}
