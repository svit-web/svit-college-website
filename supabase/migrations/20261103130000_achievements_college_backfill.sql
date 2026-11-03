-- Department achievements from before achievements_before_write existed have no
-- college_id, so college admins can neither list nor edit them (RLS and the
-- admin list both match on it). New rows get it from that trigger.
-- Idempotent: only rows still missing a college_id are touched.

update public.achievements a
set college_id = d.college_id
from public.departments d
where a.department_id = d.id
  and a.college_id is null;
