-- Defense-in-depth against raw-text-as-slug bugs (e.g. a title with spaces/
-- punctuation/& landing straight in `slug`, which broke sitemap.ts's XML).
-- The admin UI already slugifies on entry (AdminCrudManager's
-- `autoGenerateFrom`), but that's client-side and does nothing for a direct
-- SQL/dashboard write. This adds a server-side backstop: a trigger that
-- auto-fixes any malformed slug before it's stored, plus a CHECK constraint
-- as a second line of defense if the trigger is ever bypassed (e.g. COPY
-- with triggers disabled).
--
-- Case-insensitive format, matching the existing convention on
-- colleges/institutes/pages/trusts (`slug_format` constraints already in the
-- schema) — this also accommodates short uppercase club codes like AWS/ACM.

create or replace function public.normalize_slug()
returns trigger
language plpgsql
as $$
declare
  base text;
  candidate text;
  suffix int := 1;
  collision_count int;
begin
  if new.slug is null or new.slug !~* '^[a-z0-9]+(-[a-z0-9]+)*$' then
    base := trim(both '-' from regexp_replace(lower(coalesce(new.slug, '')), '[^a-z0-9]+', '-', 'g'));
    if base = '' then
      base := 'item-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
    end if;

    candidate := base;
    loop
      execute format('select count(*) from %I where slug = $1 and id is distinct from $2', tg_table_name)
        into collision_count
        using candidate, new.id;
      exit when collision_count = 0;
      suffix := suffix + 1;
      candidate := base || '-' || suffix;
    end loop;

    new.slug := candidate;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
  slug_tables text[] := array[
    'colleges', 'institutes', 'pages', 'trusts',
    'events', 'achievements', 'student_clubs', 'centers', 'facilities', 'gallery_albums', 'sports'
  ];
begin
  foreach t in array slug_tables loop
    execute format('drop trigger if exists normalize_slug_trigger on %I', t);
    execute format(
      'create trigger normalize_slug_trigger before insert or update of slug on %I for each row execute function public.normalize_slug()',
      t
    );
  end loop;
end $$;

-- CHECK constraints only where missing (colleges/institutes/pages/trusts already have `slug_format`).
alter table events add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table achievements add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table student_clubs add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table centers add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table facilities add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table gallery_albums add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table sports add constraint slug_format check (slug ~* '^[a-z0-9]+(-[a-z0-9]+)*$');
