import { redirect } from 'next/navigation';
import { getAdminUser, getScopeLevel } from '@/app/lib/auth/admin';
import { AdminShell } from '@/components/admin-next/AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  const scopeLevel = getScopeLevel(admin);

  return (
    <AdminShell admin={admin} scopeLevel={scopeLevel}>
      {children}
    </AdminShell>
  );
}
