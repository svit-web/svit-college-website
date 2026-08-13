import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminScholarshipsPage } from '@/components/admin-next/pages/AdminScholarshipsPage';

export default async function ScholarshipsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/scholarships', level)) {
    redirect('/admin');
  }

  return <AdminScholarshipsPage />;
}
