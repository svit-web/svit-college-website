import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminCrudManager } from '@/components/admin-next/AdminCrudManager';

export default async function AdminRecruitersPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/recruiters', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminCrudManager tableId="recruiters" admin={admin} />;
}
