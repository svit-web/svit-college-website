-- Footer link columns become CMS-driven: a 'footer_navigation' menu whose
-- top-level items are the footer columns and whose children are the links
-- (Admin → Menus / Nav). Seeded with the columns Footer.tsx hard-coded until
-- now, so the footer looks identical after this runs. Footer.tsx falls back to
-- those same defaults while this menu is missing or empty.
--
-- link_type is 'external' for every row, internal paths included: the
-- menu_item_url_check constraint ties 'internal' to a CMS page_id, and every
-- existing menu stores site paths as 'external' + url. Column headings get the
-- placeholder url '#' (the footer renders them as plain headings).

insert into public.menus (name, code, status)
values ('Footer Navigation', 'footer_navigation', 'published')
on conflict (code) do nothing;

with m as (
  select id from public.menus where code = 'footer_navigation'
),
cols as (
  insert into public.menu_items (menu_id, title, url, link_type, menu_type, sort_order, status)
  select m.id, c.title, '#', 'external', 'simple', c.sort_order, 'published'
  from m, (values ('Quick Links', 1), ('Important', 2)) as c(title, sort_order)
  -- Only seed an empty menu (re-running, or an admin-built menu, is left alone).
  where not exists (
    select 1 from public.menu_items mi where mi.menu_id = m.id and mi.deleted_at is null
  )
  returning id, menu_id, title
)
insert into public.menu_items (menu_id, parent_id, title, url, link_type, menu_type, sort_order, status)
select cols.menu_id, cols.id, l.title, l.url, 'external', 'simple', l.sort_order, 'published'
from cols
join (values
  ('Quick Links', 'About Us', '/about', 1),
  ('Quick Links', 'Admissions', '/admissions', 2),
  ('Quick Links', 'Campus Life', '/campus-life', 3),
  ('Quick Links', 'Placement', '/placement', 4),
  ('Quick Links', 'News & Events', '/news', 5),
  ('Important', 'Anti-Ragging', '/anti-ragging', 1),
  ('Important', 'Grievance Redressal', '/grievance', 2),
  ('Important', 'Downloads', '/downloads', 3),
  ('Important', 'Careers', '/careers', 4),
  ('Important', 'Alumni', 'https://alumni.svitvasad.ac.in', 5)
) as l(col, title, url, sort_order) on l.col = cols.title;
