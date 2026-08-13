import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminLabsPage } from '@/components/admin-next/pages/AdminLabsPage';

export default async function LabsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/labs', level)) {
    redirect('/admin');
  }

  return <AdminLabsPage admin={admin} />;
}
