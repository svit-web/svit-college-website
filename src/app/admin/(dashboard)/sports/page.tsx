import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminSportsPage } from '@/components/admin-next/pages/AdminSportsPage';

export default async function SportsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/sports', level)) {
    redirect('/admin');
  }

  return <AdminSportsPage admin={admin} />;
}
