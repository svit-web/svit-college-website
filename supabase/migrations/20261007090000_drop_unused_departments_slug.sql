-- departments.slug was admin-editable (via the generic AdminCrudManager grid)
-- but every department route resolves by `code`, not `slug` — see
-- getDepartmentByCode in src/lib/departments.functions.ts, which every
-- /departments/[dept]* route and all department link-building call. The one
-- live consumer of department-by-slug (getEngDeptBySlug/getEngDepts in
-- src/lib/programmes.functions.ts, used only by the legacy
-- /courses/engineering/[dept] redirect routes) is being removed in this same
-- change. Dropping the column also drops its slug_format CHECK, the
-- unique_college_dept_slug constraint, and the idx_dept_slug index.
ALTER TABLE public.departments DROP COLUMN IF EXISTS slug;
