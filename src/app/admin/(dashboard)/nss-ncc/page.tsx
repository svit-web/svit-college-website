import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminNssNccPage } from '@/components/admin-next/pages/AdminNssNccPage';

export default async function NssNccPageRoute() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/nss-ncc', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminNssNccPage admin={admin} />;
}
