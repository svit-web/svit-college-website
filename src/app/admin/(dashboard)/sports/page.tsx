import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminSportsPage } from '@/components/admin-next/pages/AdminSportsPage';

export default async function SportsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/sports', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminSportsPage admin={admin} />;
}
