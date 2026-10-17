import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminTnpHubPage } from '@/components/admin-next/pages/AdminTnpHubPage';

export default async function TnpHubPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/tnp-hub', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminTnpHubPage />;
}
