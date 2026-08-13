import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { getContactInfo } from '@/lib/pages.functions';
import { getMiscSettings } from '@/lib/site-settings.functions';
import { AdminSettingsPage } from '@/components/admin-next/pages/AdminSettingsPage';

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/settings', level)) {
    redirect('/admin');
  }

  const [contact, misc] = await Promise.all([getContactInfo().catch(() => null), getMiscSettings().catch(() => null)]);

  return <AdminSettingsPage initialContact={contact as any} initialMisc={misc} />;
}
