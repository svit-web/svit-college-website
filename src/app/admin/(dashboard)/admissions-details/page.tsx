import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminAdmissionsDetailsPage } from '@/components/admin-next/pages/AdminAdmissionsDetailsPage';

export default async function AdmissionsDetailsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/admissions-details', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminAdmissionsDetailsPage />;
}
