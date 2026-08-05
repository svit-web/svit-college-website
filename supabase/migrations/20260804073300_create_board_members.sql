-- Board of Management: promote from pages.metadata.leadership.boardOfManagement
-- (name/designation only) into its own table so it can carry real trustee
-- photos and be managed via the generic admin CRUD (photo upload auto-enabled
-- by the _url column suffix). Follows the same shape/RLS as committees.

create table public.board_members (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id),
  name text not null,
  designation text not null,
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

alter table public.board_members enable row level security;

create policy "Anon SELECT" on public.board_members
  for select to anon using (true);

create policy "Auth CRUD" on public.board_members
  for all to authenticated using (true) with check (true);

-- Seed the existing 6 trustees (previously in pages.metadata.leadership.boardOfManagement)
do $$
declare
  v_svit_id uuid;
begin
  select id into v_svit_id from colleges where slug = 'svit-degree';

  insert into board_members (college_id, name, designation, sort_order, status) values
  (v_svit_id, 'Patel Bhaskerbhai Chandubhai', 'Chairman – SVIT & NEST', 1, 'published'),
  (v_svit_id, 'Patel Dipakkumar Kantibhai', 'NEST – Trustee', 2, 'published'),
  (v_svit_id, 'Patel Sandipbhai Rameshbhai', 'Vice Chairman – NEST', 3, 'published'),
  (v_svit_id, 'Patel Bhaveshbhai Rameshbhai', 'Secretary – NEST', 4, 'published'),
  (v_svit_id, 'Patel Ketanbhai Bhupendrabhai', 'Jt. Secretary – NEST', 5, 'published'),
  (v_svit_id, 'Patel Kishorkumar Ramdas', 'Treasurer – NEST', 6, 'published');
end $$;

-- Drop the now-redundant boardOfManagement key from the About page's metadata blob
update pages
set metadata = jsonb_set(
  metadata,
  '{leadership}',
  (metadata->'leadership') - 'boardOfManagement'
)
where slug = 'about';
