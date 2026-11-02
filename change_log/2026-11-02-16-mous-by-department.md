# 16 — MoUs by department, Placement MoUs page, department MoUs tab

Migration: `20261102120000_mous_department_scope.sql`. Its columns and backfill are on production;
its write policy still needs testing as a department or Placement user.

## Database
- `mous.department_id` links a MoU to its department; `mous.college_id` is derived from it by the
  `mous_before_write` trigger. A MoU with no department is institute-wide.
- Backfill from the old free-text `department_name`: MCA → MCA (10), Computer → CE (1),
  Electrical → EE (1). 7 MoUs had no department and stay institute-wide.
- Write access moves from global admins only (policy "Global write mous") to "Scoped write mous":
  global admins; the owning department or college, and trust/institute admins above them; and
  holders of the `placement` section grant (a global grant covers every MoU, a college or
  department grant only that part). Institute-wide MoUs stay with global admins and global
  Placement grants. Reads are unchanged.

## Public site
- New `/placement/mous`: every MoU with its department named, with department filter chips.
- `/placement`: a preview of the 6 newest MoUs with a "View all" link.
- New `/departments/<code>/mous`: only that department's MoUs. The **MoUs** tab beside
  Departmental Events shows only when the department has any; without any, the URL redirects to
  the department page.
- `/about/accreditation`: the full table is replaced by a count and a link to the Placement page.
- Centre pages use the same shared `MouCard`.
- Sitemap and search index include the new pages.
- `getAllMOUs` falls back to a plain select if the department join isn't available, so a deploy
  ahead of the migration can't empty the MoU lists.

## Admin (`/admin/tables/mous`, sidebar Campus Life → MOUs)
- Now reachable by department, college, trust and institute admins and Placement users, not only
  global admins (removed from the global-only lists; added to `ROUTE_SECTION_MAP` for `placement`).
- Department admins see only their own MoUs; the Department field is preassigned and locked.
- College admins see their college's MoUs.
- `college_id` and `department_name` are hidden in the form.

## Expired MoUs
- From the day after `expiry_date` (India time) a MoU no longer shows anywhere on the public site:
  Placement, department tab, accreditation count, centre pages and the sitemap. A department left
  with only expired MoUs loses its MoUs tab.
- Done with `notExpiredFilter()` when reading, not by changing `status`, so it needs no scheduled
  job and an extended date brings the MoU back. It stays listed in `/admin/tables/mous`, where its
  status still reads Published.

## Verify
1. Department admin: `/admin/tables/mous` → Add → Department is locked to theirs → save → it shows
   on `/departments/<code>/mous` and on `/placement/mous` with the department named.
2. A department admin can't edit another department's MoU or an institute-wide one.
3. A user with a global `placement` grant can add, edit and delete any MoU.
4. A department with no MoUs has no MoUs tab.
5. A MoU with a past expiry date is listed in admin but appears nowhere on the site.
