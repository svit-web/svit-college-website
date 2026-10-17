-- ADR 0003 cleanup pass: metadata keys that duplicate real columns (merge
-- first where the column is null) or hold dead data no code reads. Legacy /
-- import keys (legacy_id, legacy_source, migrated_from, auto_imported,
-- review_note, date_estimated) are deliberately left alone.

-- staff_profiles: merge into the real columns where they are null, then drop.
update public.staff_profiles
set past_experience_years = (metadata->>'experienceYears')::int
where metadata ? 'experienceYears'
  and past_experience_years is null
  and (metadata->>'experienceYears') ~ '^\d+$';

update public.staff_profiles
set photo_url = metadata->>'photoUrl'
where metadata ? 'photoUrl' and photo_url is null
  and coalesce(metadata->>'photoUrl', '') <> '';

-- email_work merges only where exactly one profile carries the address: two
-- rows hold dipenbrahmbhatt.ic@ (an address that belongs to neither of them),
-- and 20260916095240 deliberately nulled such ambiguous emails — do not
-- resurrect them.
update public.staff_profiles sp
set email = sp.metadata->>'email_work'
where sp.metadata ? 'email_work'
  and sp.email is null
  and coalesce(sp.metadata->>'email_work', '') <> ''
  and (select count(*) from public.staff_profiles s2
       where lower(s2.metadata->>'email_work') = lower(sp.metadata->>'email_work')) = 1;

update public.staff_profiles
set phone = metadata->>'phone'
where metadata ? 'phone' and phone is null
  and coalesce(metadata->>'phone', '') <> '';

update public.staff_profiles
set metadata = metadata - 'experienceYears' - 'photoUrl' - 'email_work' - 'phone'
where metadata ?| array['experienceYears', 'photoUrl', 'email_work', 'phone'];

-- departments: labs are real facility rows (facility_type 'laboratory',
-- department_id FK) rendered by /departments/[dept]/labs; nba_accredited is
-- an institution-level fact already on the About page (recognitions +
-- NBA Status document); intake was a single '-1' junk value. Departments
-- carry intake_ug / intake_pg for real.
update public.departments
set metadata = metadata - 'labs' - 'nba_accredited' - 'intake'
where metadata ?| array['labs', 'nba_accredited', 'intake'];

-- facilities: on 36/37 rows metadata.images is exactly [card_photo_url] —
-- a duplicate of the entry-model card photo. lab-nursing-2-inf106 keeps its
-- key: its image is a distinct original asset not referenced anywhere else.
update public.facilities
set metadata = metadata - 'images'
where metadata ? 'images'
  and jsonb_typeof(metadata->'images') = 'array'
  and jsonb_array_length(metadata->'images') = 1
  and metadata->'images'->>0 = card_photo_url;

-- achievements: level / position / sport_id were TanStack-era fields with no
-- reader since the sports/achievements rework.
update public.achievements
set metadata = metadata - 'level' - 'position' - 'sport_id'
where metadata ?| array['level', 'position', 'sport_id'];

-- trusts: description / short_name / established_year never had readers;
-- trust display uses the name/code columns.
update public.trusts
set metadata = metadata - 'description' - 'short_name' - 'established_year'
where metadata ?| array['description', 'short_name', 'established_year'];

-- recruiters: colleges was meant for per-college recruiter filtering that
-- was never built — the public recruiter wall is a single trust-wide list.
update public.recruiters
set metadata = metadata - 'colleges'
where metadata ? 'colleges';

-- downloads: label duplicates the title column.
update public.downloads
set metadata = metadata - 'label'
where metadata ? 'label';
