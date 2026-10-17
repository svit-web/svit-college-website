-- Drop dead tables with no readers or writers anywhere in the app:
-- homepage_sections/homepage_widgets (referenced only as an FK-label config
-- entry and a trash allowlist entry, never as a managed CRUD table or page
-- builder; no public query reads them) and redirects (next.config.ts's
-- redirects() returns a hardcoded array and never queries this table; no
-- admin UI writes to it either).
drop table if exists public.homepage_widgets cascade;
drop table if exists public.homepage_sections cascade;
drop table if exists public.redirects cascade;
