import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminLabsPage } from '@/components/admin-next/pages/AdminLabsPage';

export default async function LabsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/labs', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminLabsPage admin={admin} />;
}
