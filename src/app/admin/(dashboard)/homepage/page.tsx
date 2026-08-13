import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { getHeroAppearance } from '@/lib/theme.functions';
import { AdminHomepagePage } from '@/components/admin-next/pages/AdminHomepagePage';

export default async function HomepagePage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/homepage', level)) {
    redirect('/admin');
  }

  const appearance = await getHeroAppearance();

  return <AdminHomepagePage admin={admin} initialAppearance={appearance} />;
}
