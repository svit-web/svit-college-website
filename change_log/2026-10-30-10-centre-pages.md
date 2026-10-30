# 10 — Dedicated Centre of Excellence and NSS / NCC pages + admin

## Public site
- New **`/campus-life/centre-of-excellence`** page, a new **Centre of Excellence** tab in the
  Campus Life tab bar (after Student Groups), and the Campus Life mega menu's CoE entry now
  points there. `/coe` and `/student-corner/coe` 308-redirect to it; the old top-level
  `src/app/(site)/coe/page.tsx` is removed; sitemap updated.
- **`/campus-life/nss-ncc`** rebuilt on the same sections.
- Sections, each hidden while empty (`CenterPageSections.tsx`): Overview (name, tagline,
  about, photos), Highlights, **The Lab** (the CoE's single lab: name, about, location,
  established, capacity, timings, industry partner), **Equipment details**,
  **Training & certification programmes** (type, certified by, duration, mode, eligibility,
  Register link), **MoUs & industry partners**, **Recent events & workshops** (6 newest),
  **Recent achievements** (6 newest), **Coordinators & team** (faculty / students / mentors).

## Admin
- New **`/admin/coe`** and **`/admin/nss-ncc`** (sidebar → Campus Life), tabs: Overview &
  Photos, Highlights, Lab (CoE only), Equipment (CoE only), Training & Certification, MoUs,
  Events, Achievements, Coordinators & Team.
  - List tabs add / edit / reorder / soft-delete rows (Trash & Recovery restores them).
  - MoUs / Events / Achievements tabs list the existing rows with a tick box: ticking sets
    the row's `center_id` so it shows on that page. New rows are still created in MOUs /
    Events / Achievements, which also gained a **Center** field.
  - Team rows pick a staff profile (name, photo and profile link come from it) or take a
    typed name for students / external mentors.
- Access: global admins and the `campus_life` section grant (same as other Campus Life
  admin routes). Writes are enforced by RLS via `can_write_center()`.

## Migration: `supabase/migrations/20261030140000_centre_pages.sql` (applied on production)
- `can_write_center(center_id)`: the parent centre's own write rule (scoped admin of its
  institute/college, or the `campus_life` section grant).
- New tables `center_equipment`, `center_programs`, `center_members` (public read of
  published rows; writes via `can_write_center`; audit + updated_at triggers).
- Nullable `center_id` (FK → centers, on delete set null) on `mous`, `events`, `achievements`.

Apply on self-hosted, then `NOTIFY pgrst, 'reload schema';`. `types.ts` was hand-edited.

## Verify
1. `/coe` → redirects to `/campus-life/centre-of-excellence`; the tab is highlighted.
2. `/admin/coe` → Lab tab: enter a name → "The Lab" section appears on the page.
3. Add an equipment row and a programme → both sections appear.
4. Events tab → tick an event → it appears under "Recent events & workshops".
5. Team → add a staff-linked member and a typed student → grouped cards appear.
6. `/admin/nss-ncc` → same for NSS / NCC (no Lab / Equipment tabs).

## Caveat
A `campus_life` grant holder with **no** college/institute scope reads `centers` only if the
centre row is published (public policy). If such a user must edit a draft centre, add a
section read policy as in change 09.
