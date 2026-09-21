import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { getHeroAppearance } from '@/lib/theme.functions';
import { AdminHomepagePage } from '@/components/admin-next/pages/AdminHomepagePage';

export default async function HomepagePage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/homepage', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  const appearance = await getHeroAppearance();

  return <AdminHomepagePage admin={admin} initialAppearance={appearance} />;
}
