-- Contact numbers shown in the site footer: any number of institute-wide
-- numbers (college_id null) plus optional per-college numbers, replacing the
-- single app_settings.contact_info.phone in the footer (that field stays — the
-- footer falls back to it while this table is empty, and the Organization
-- JSON-LD keeps using it as the one primary number).
--
-- Writes: global admins for everything; college-scoped admins for their own
-- college's rows (institute-wide rows stay global-only).

create table public.contact_numbers (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references public.colleges(id),
  label text not null,
  phone text not null,
  kind text not null default 'phone'
    check (kind in ('phone', 'mobile', 'whatsapp', 'fax')),
  show_in_footer boolean not null default true,
  sort_order integer not null default 0,
  status content_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  created_by uuid references public.user_profiles(id),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id)
);

create index contact_numbers_list_idx on public.contact_numbers (college_id, sort_order)
  where deleted_at is null;

alter table public.contact_numbers enable row level security;

create policy "Public read published contact_numbers" on public.contact_numbers
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null)
    or public.is_global_admin()
    or (college_id is not null and public.can_write_scoped_record(null, null, college_id, null)));

create policy "Scoped write contact_numbers" on public.contact_numbers
  for all to authenticated
  using (public.is_global_admin()
    or (college_id is not null and public.can_write_scoped_record(null, null, college_id, null)))
  with check (public.is_global_admin()
    or (college_id is not null and public.can_write_scoped_record(null, null, college_id, null)));

create trigger update_contact_numbers_modtime
  before update on public.contact_numbers
  for each row execute function public.update_updated_at_column();

create trigger audit_contact_numbers_trigger
  after insert or delete or update on public.contact_numbers
  for each row execute function public.process_audit_log();

-- Carry today's footer number over as the first institute-wide entry, so the
-- footer looks the same until admins add more.
insert into public.contact_numbers (label, phone, sort_order)
select 'Phone', btrim(value->>'phone'), 1
from public.app_settings
where key = 'contact_info' and coalesce(btrim(value->>'phone'), '') <> '';
