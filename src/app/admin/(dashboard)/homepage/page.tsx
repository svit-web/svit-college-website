import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { getHeroAppearance } from '@/lib/theme.functions';
import { getHomePopupForAdmin } from '@/lib/home-popup.functions';
import { AdminHomepagePage } from '@/components/admin-next/pages/AdminHomepagePage';

export default async function HomepagePage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/homepage', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  // Mirrors the DB's is_global_admin(): any role granted at global scope.
  const isGlobalAdmin = admin.roles.some((r) => r.scope_type === 'global');

  const [appearance, popup] = await Promise.all([
    getHeroAppearance(),
    isGlobalAdmin ? getHomePopupForAdmin() : Promise.resolve(null),
  ]);

  return <AdminHomepagePage admin={admin} initialAppearance={appearance} initialPopup={popup} />;
}
