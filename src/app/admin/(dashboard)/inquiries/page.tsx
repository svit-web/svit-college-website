import { redirect } from 'next/navigation';
import { requireAdmin, getScopeLevel } from '@/app/lib/auth/admin';
import { isRouteAllowedForScope } from '@/lib/admin-sections';
import { AdminInquiriesPage } from '@/components/admin-next/pages/AdminInquiriesPage';

export default async function InquiriesPage() {
  const admin = await requireAdmin();
  const level = getScopeLevel(admin);

  if (!isRouteAllowedForScope('/admin/inquiries', level)) {
    redirect('/admin');
  }

  return <AdminInquiriesPage admin={admin} />;
}
