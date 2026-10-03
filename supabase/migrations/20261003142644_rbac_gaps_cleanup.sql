-- Drop unused RBAC tables (permissions, role_permissions): zero rows, no code
-- references, no RLS/policy dependents. Confirmed dead per docs/audits/deferred-issues.md.
drop table if exists public.role_permissions;
drop table if exists public.permissions;

-- Drop unreferenced legacy enum type (superseded by the roles table + role_id FK).
drop type if exists public.user_role_enum;

-- Drop unused helper: matches role code 'department_admin', which has no row
-- in `roles` (scoped admins are granted via the 'editor' code + scope_type),
-- so this predicate is permanently false and it is not referenced by any
-- RLS policy.
drop function if exists public.current_user_is_dept_admin_for(uuid);

-- Drop duplicate index on user_roles.user_id (idx_user_roles_user_id and
-- user_roles_user_id_idx are identical btree(user_id) indexes).
drop index if exists public.idx_user_roles_user_id;

-- admin_sections had no updated_at-maintaining trigger.
create trigger update_admin_sections_modtime
  before update on public.admin_sections
  for each row execute function public.update_updated_at_column();

-- Replace the two near-duplicate per-table updated_at trigger functions with
-- the shared update_updated_at_column(), then drop the now-unused functions.
drop trigger if exists trg_sports_updated_at on public.sports;
create trigger trg_sports_updated_at
  before update on public.sports
  for each row execute function public.update_updated_at_column();
drop function if exists public.update_sports_updated_at();

drop trigger if exists scholarships_updated_at on public.scholarships;
create trigger scholarships_updated_at
  before update on public.scholarships
  for each row execute function public.update_updated_at_column();
drop function if exists public.set_scholarships_updated_at();
