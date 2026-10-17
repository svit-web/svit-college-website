import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminCrudManager } from '@/components/admin-next/AdminCrudManager';

export default async function AdminPostsPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/posts', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminCrudManager tableId="posts" admin={admin} />;
}
