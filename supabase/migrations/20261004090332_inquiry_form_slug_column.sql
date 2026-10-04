-- inquiry_forms.metadata.slug is an identifier, not content — ADR 0003 says
-- identifiers get real columns. Promote it, backfill, drop the JSON key.

alter table public.inquiry_forms add column slug text;

update public.inquiry_forms
set slug = metadata->>'slug'
where metadata ? 'slug';

alter table public.inquiry_forms alter column slug set not null;
create unique index inquiry_forms_slug_key on public.inquiry_forms (slug);

update public.inquiry_forms
set metadata = metadata - 'slug'
where metadata ? 'slug';
