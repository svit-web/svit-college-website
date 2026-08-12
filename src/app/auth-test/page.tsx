import { getAdminUser, getScopeConstraints } from '@/app/lib/auth/admin';
import { createClient } from '@/app/lib/supabase/server';

export default async function AuthTestPage() {
  const admin = await getAdminUser();

  if (!admin) {
    return (
      <div className="container-page py-20">
        <h1 className="text-3xl font-bold text-navy mb-4">Auth Test</h1>
        <p className="text-muted-foreground mb-4">Not authenticated or not authorized</p>
        <a href="/auth-test/login" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
          Go to Login
        </a>
      </div>
    );
  }

  const supabase = await createClient();
  const constraints = getScopeConstraints(admin);

  // Test RLS by fetching user_roles (should return scoped results)
  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('id, user_id, scope_type, role:role_id(code, name)')
    .eq('status', 'published')
    .limit(10);

  return (
    <div className="container-page py-20">
      <h1 className="text-3xl font-bold text-navy mb-6">Auth Test — Phase 2 Gate</h1>

      <div className="space-y-6">
        <section className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <dl className="space-y-2">
            <div><dt className="font-medium text-muted-foreground">Email:</dt><dd>{admin.email}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Name:</dt><dd>{admin.first_name} {admin.last_name}</dd></div>
            <div><dt className="font-medium text-muted-foreground">Roles:</dt><dd>{admin.roles.map(r => r.code).join(', ')}</dd></div>
          </dl>
        </section>

        <section className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Scope Constraints</h2>
          {constraints ? (
            <dl className="space-y-2">
              <div><dt className="font-medium text-muted-foreground">Scope Type:</dt><dd>{constraints.scopeType}</dd></div>
              {constraints.collegeId && <div><dt className="font-medium text-muted-foreground">College ID:</dt><dd>{constraints.collegeId}</dd></div>}
              {constraints.departmentId && <div><dt className="font-medium text-muted-foreground">Department ID:</dt><dd>{constraints.departmentId}</dd></div>}
            </dl>
          ) : (
            <p className="text-muted-foreground">Global access (no constraints)</p>
          )}
        </section>

        <section className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">RLS Test: user_roles Query</h2>
          {error ? (
            <p className="text-destructive">Error: {error.message}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">
                Returned {userRoles?.length || 0} rows (should be scoped if not global admin)
              </p>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                {JSON.stringify(userRoles, null, 2)}
              </pre>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
