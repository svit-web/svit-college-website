-- Events/Achievements scope integrity — fixes two bugs found during the
-- 2026-10-13 admin-panel audit (docs/audits/events-achievements-add-flow-2026-10.md):
--
-- #1: a college-scoped admin picking a Department for their own event hits a
--     raw "violates check constraint events_scope_consistency" error — the
--     CHECK constraints only gate which columns must be null per scope_type,
--     they say nothing about department_id/college_id actually belonging
--     together. Paired with an AdminCrudManager.tsx fix that stops the UI
--     from offering that invalid combination in the first place.
-- #2: with both department_id and college_id independently editable, any
--     admin (global included) could pick a department from one college and
--     a college_id from a different one — the CHECK constraints allow it,
--     so it saved silently. Reproduced live: an event with department_id
--     pointing at Nursing (Patel Institute of Nursing) and college_id
--     pointing at SVIT saved with no error.
--
-- This migration is the DB-layer backstop for both, independent of the UI
-- fix, per this repo's "RLS/DB constraints are the real guard, UI is
-- convenience" convention (see CLAUDE.md).

-- 1) achievements never had events_before_write's college-backfill — any
--    scope_type='department' achievement left college_id permanently null.
create or replace function public.achievements_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.scope_type = 'department' and new.department_id is not null and new.college_id is null then
    select d.college_id into new.college_id from public.departments d where d.id = new.department_id;
  end if;
  return new;
end;
$$;

drop trigger if exists achievements_before_write_trigger on public.achievements;
create trigger achievements_before_write_trigger
  before insert or update on public.achievements
  for each row execute function public.achievements_before_write();

-- 2) Cross-validate: whenever both columns are set, department_id's own
--    college must match college_id. Fires after the backfill triggers above
--    (alphabetically "achievements_before_write_trigger"/"events_before_write_trigger"
--    both sort before "validate_department_college_*_trigger", so the
--    backfilled value is what gets checked, not a stale pre-backfill null).
create or replace function public.validate_department_college_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_dept_college_id uuid;
  v_dept_name text;
begin
  if new.department_id is not null and new.college_id is not null then
    select d.college_id, d.name into v_dept_college_id, v_dept_name
    from public.departments d where d.id = new.department_id;

    if v_dept_college_id is distinct from new.college_id then
      raise exception 'Department "%" belongs to a different college than the one selected', v_dept_name;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_department_college_events_trigger on public.events;
create trigger validate_department_college_events_trigger
  before insert or update on public.events
  for each row execute function public.validate_department_college_match();

drop trigger if exists validate_department_college_achievements_trigger on public.achievements;
create trigger validate_department_college_achievements_trigger
  before insert or update on public.achievements
  for each row execute function public.validate_department_college_match();

-- 3) #9 from the same audit: events has audit_events_trigger, achievements
--    never had an equivalent — any write outside the admin UI's own
--    logAuditAction() left zero trail.
drop trigger if exists audit_achievements_trigger on public.achievements;
create trigger audit_achievements_trigger
  after insert or update or delete on public.achievements
  for each row execute function public.process_audit_log();
