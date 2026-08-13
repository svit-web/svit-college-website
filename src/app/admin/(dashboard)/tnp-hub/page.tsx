import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminTnpHubPage } from '@/components/admin-next/pages/AdminTnpHubPage';

export default async function TnpHubPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/tnp-hub', level)) {
    redirect('/admin');
  }

  return <AdminTnpHubPage />;
}
