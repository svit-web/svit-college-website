-- Central Library: dedicated /campus-life/central-library page.
--
-- The page's core (name, subtitle, description, highlights, photo album,
-- per-college book counts) stays on the existing facilities row
-- (slug = 'library', already tagged admin_section_id = 'library'). These two
-- tables hold the repeatable lists that don't fit a single facility row, edited
-- through the generic admin CRUD (/admin/tables/library_*).
--
-- Writes: global admins, or anyone holding the 'library' section grant — the
-- same rule as downloads (20261003135303_wire_library_section_to_downloads.sql).

-- E-journals, databases, the OPAC and remote-access portals.
create table public.library_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'e_journal'
    check (category in ('e_journal', 'database', 'opac', 'remote_access', 'digital_library', 'other')),
  publisher text,
  description text,
  website_url text,
  access_note text,
  logo_url text,
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

-- Everything else on the page, grouped by kind: opening hours, services,
-- rules, headline figures and contact lines. `value` is the short right-hand
-- text (e.g. "9:00 AM – 6:00 PM", "30,000+", an email address).
create table public.library_info_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null
    check (kind in ('timing', 'service', 'rule', 'stat', 'contact')),
  title text not null,
  value text,
  description text,
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

create index library_resources_list_idx on public.library_resources (category, sort_order)
  where deleted_at is null;
create index library_info_items_list_idx on public.library_info_items (kind, sort_order)
  where deleted_at is null;

alter table public.library_resources enable row level security;
alter table public.library_info_items enable row level security;

create policy "Public read published library_resources" on public.library_resources
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null)
    or public.is_global_admin() or public.can_write_section('library'::text));
create policy "Library write library_resources" on public.library_resources
  for all to authenticated
  using (public.is_global_admin() or public.can_write_section('library'::text))
  with check (public.is_global_admin() or public.can_write_section('library'::text));

create policy "Public read published library_info_items" on public.library_info_items
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null)
    or public.is_global_admin() or public.can_write_section('library'::text));
create policy "Library write library_info_items" on public.library_info_items
  for all to authenticated
  using (public.is_global_admin() or public.can_write_section('library'::text))
  with check (public.is_global_admin() or public.can_write_section('library'::text));

create trigger update_library_resources_modtime
  before update on public.library_resources
  for each row execute function public.update_updated_at_column();
create trigger update_library_info_items_modtime
  before update on public.library_info_items
  for each row execute function public.update_updated_at_column();

create trigger audit_library_resources_trigger
  after insert or delete or update on public.library_resources
  for each row execute function public.process_audit_log();
create trigger audit_library_info_items_trigger
  after insert or delete or update on public.library_info_items
  for each row execute function public.process_audit_log();

-- Seed only what the site already states (the library facility's description
-- and "E-resources" highlight). Timings, rules, services and contacts are left
-- for the library team to enter — the page hides any empty section.
insert into public.library_resources (name, category, publisher, website_url, sort_order) values
  ('IEEE Xplore', 'e_journal', 'IEEE', 'https://ieeexplore.ieee.org', 1),
  ('ASME Digital Collection', 'e_journal', 'ASME', 'https://asmedigitalcollection.asme.org', 2),
  ('SpringerLink', 'e_journal', 'Springer Nature', 'https://link.springer.com', 3),
  ('ScienceDirect', 'e_journal', 'Elsevier', 'https://www.sciencedirect.com', 4);

insert into public.library_info_items (kind, title, value, sort_order) values
  ('stat', 'Titles', '30,000+', 1);
