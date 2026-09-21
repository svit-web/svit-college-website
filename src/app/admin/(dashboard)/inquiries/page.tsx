import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForUser } from '@/lib/admin-sections';
import { AdminInquiriesPage } from '@/components/admin-next/pages/AdminInquiriesPage';

export default async function InquiriesPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForUser('/admin/inquiries', level, admin.sections.map((s) => s.code))) {
    redirect('/admin');
  }

  return <AdminInquiriesPage admin={admin} />;
}
