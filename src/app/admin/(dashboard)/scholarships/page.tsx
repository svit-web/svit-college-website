import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminScholarshipsPage } from '@/components/admin-next/pages/AdminScholarshipsPage';

export default async function ScholarshipsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/scholarships', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminScholarshipsPage />;
}
