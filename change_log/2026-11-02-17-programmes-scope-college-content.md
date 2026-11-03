# 17 — Programmes page, course fields, department scope, college content on departments

Migrations: `20261103120000_programme_entries.sql`, `20261103130000_achievements_college_backfill.sql`.
Both are already on production. The form and page changes need a deploy.

## Programmes and courses
- `/courses` is grouped into Undergraduate, Postgraduate, Diploma and Doctorate by `degree_level`.
- New Programme entries: M.E. (one card for Structural and Software Engineering), BCA, Interior
  Design, B.Sc Nursing and GNM.
- Admin: Degree Level shows Postgraduate and Diploma instead of `graduate` and `certificate`.
- Admin: Highlights and Outcomes are their own fields on every course, and show on `/courses/<code>`
  and `/programs/<id>`.
- `is_programme` is set from the department on save: no department means Programme. The checkbox
  is gone.

## Department scope for college admins (Achievements, Events)
- Scope Type offers College or Department. Department then requires a department from their own
  college, so the record shows on that department's page.
- Department events now stay in a college admin's list.
- 150 older achievements got their missing `college_id`, so college admins can see and edit them.

## College content on department pages
- Colleges can show their own achievements, events and facilities on their department pages,
  labelled College-wide. Records stay college-level, with no copies.
- Default: on for a college with one department (COA, SVION), off otherwise. Override with the
  switch in `/admin/homepage` → College Pages, stored in `colleges.metadata` only when it differs
  from the default.
- Department items come first. College facilities have their own section on Labs & Facilities.

## Verify
1. `/departments/ARCH/achievements` shows COA's achievements labelled College-wide.
2. `/departments/IT/achievements` shows none.
3. Turn the switch on for MBA and save: `/departments/MBA/achievements` shows its college item.
4. As a college admin, add a Department-scope achievement: it shows on that department's page.
