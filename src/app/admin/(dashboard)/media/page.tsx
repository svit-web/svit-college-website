import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminMediaPage } from '@/components/admin-next/pages/AdminMediaPage';

export default async function MediaPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/media', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminMediaPage admin={admin} />;
}
