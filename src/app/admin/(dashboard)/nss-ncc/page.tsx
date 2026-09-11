import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminNssNccPage } from '@/components/admin-next/pages/AdminNssNccPage';

export default async function NssNccPageRoute() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/nss-ncc', level)) {
    redirect('/admin');
  }

  return <AdminNssNccPage admin={admin} />;
}
