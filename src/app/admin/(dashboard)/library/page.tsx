import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminLibraryPage } from '@/components/admin-next/pages/AdminLibraryPage';

export default async function LibraryPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (
    !isRouteAllowedForUser(
      '/admin/library',
      level,
      admin.sections.map((s) => s.code),
    )
  ) {
    redirect('/admin');
  }

  // Section-only users (Librarian) can't open Staff Profiles — don't link them there.
  return <AdminLibraryPage canManageStaff={level !== 'section'} />;
}
