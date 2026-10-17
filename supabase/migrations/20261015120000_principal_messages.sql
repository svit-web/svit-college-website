-- Principal messages: any number of principal messages (name/title/content/
-- photo) shown on /about/principal-message, edited by global admins through
-- the generic admin CRUD (photo upload auto-enabled by the _url suffix).
-- college_id is an optional label, not a scope: writes are global-admin only.

create table public.principal_messages (
  id uuid primary key default gen_random_uuid(),
  college_id uuid references public.colleges(id),
  name text not null,
  title text,
  content text not null default '',
  photo_url text,
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

alter table public.principal_messages enable row level security;

create policy "Public read published principal_messages" on public.principal_messages
  for select to anon, authenticated
  using ((status = 'published' and deleted_at is null) or public.is_global_admin());

create policy "Global insert principal_messages" on public.principal_messages
  for insert to authenticated with check (public.is_global_admin());
create policy "Global update principal_messages" on public.principal_messages
  for update to authenticated
  using (public.is_global_admin()) with check (public.is_global_admin());
create policy "Global delete principal_messages" on public.principal_messages
  for delete to authenticated using (public.is_global_admin());

create trigger update_principal_messages_modtime
  before update on public.principal_messages
  for each row execute function public.update_updated_at_column();

-- Carry the existing About-page principal over as the first entry. The
-- pages.metadata.leadership.principal JSON is left in place (now unused).
insert into public.principal_messages (college_id, name, title, content, photo_url, sort_order)
select
  (select id from public.colleges where slug = 'svit-degree'),
  p->>'name',
  nullif(p->>'title', ''),
  coalesce(concat_ws(E'\n\n', nullif(p->>'quote', ''), nullif(p->>'bodyText', '')), ''),
  nullif(p->>'photoUrl', ''),
  1
from public.pages, lateral (select metadata->'leadership'->'principal' as p) x
where slug = 'about' and coalesce(p->>'name', '') <> '';
