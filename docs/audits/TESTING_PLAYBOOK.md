# Admin Panel + Public Site Testing Playbook

A how-to for systematically testing this admin panel — written so a fresh agent/session with zero
conversation history can pick it up and keep going. Not a findings doc; see the dated audit files in
this directory for those.

## 1. What's already been covered

| Audit | Date | Covered | Status |
|---|---|---|---|
| `admin-role-audit-2026-10.md` | 2026-10-13 | Role/permission CRUD across admin (global), college admin, department admin, sports_secretary — nav visibility, write-permission correctness, RLS alignment | 3 bugs found & fixed |
| `events-achievements-add-flow-2026-10.md` | 2026-10-13/14 | Deep "Add New" flow for Events & Achievements across all scope tiers — validation gaps, DB trigger behavior, non-technical-professor UX, backend-only gotchas (search index, audit trail) | 9 bugs found & fixed |

Read both before starting new work — don't re-test ground already walked. Everything below either
extends that work or lists what neither audit touched yet (section 5).

## 2. Methodology — reusable verbatim

### 2.1 There is no safe throwaway environment

This app has exactly one real backend: the self-hosted Supabase instance is **production** (per
`CLAUDE.md`), and it's what `npm run dev` talks to. There's no staging DB. Testing means creating
real-but-temporary rows and hard-deleting them when done — never leave soft-deleted test rows sitting in
Trash, never leave temp accounts behind.

**Creating a temp account at any scope tier** — copy-paste, change the UUID suffix/email/scope columns:

```sql
-- Pick a fresh, obviously-fake UUID (increment the last two hex digits so you
-- don't collide with earlier sessions' temp accounts, which should already
-- be cleaned up anyway — check first: select email from auth.users where
-- email like 'temp.%@svitvasad.ac.in';)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
  phone_change_token, email_change, phone_change, reauthentication_token
) VALUES (
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', '00000000-0000-0000-0000-000000000000',
  'temp.myrole@svitvasad.ac.in', extensions.crypt('Temp#Pass123', extensions.gen_salt('bf', 10)),
  now(), '{"first_name": "Temp", "last_name": "MyRole"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb, 'authenticated', 'authenticated', now(), now(),
  '', '', '', '', '', '', '', ''
);
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
VALUES (
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1',
  '{"sub": "e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1", "email": "temp.myrole@svitvasad.ac.in", "email_verified": true, "phone_verified": false}'::jsonb,
  'email', now(), now()
);

-- Pick ONE of these depending on what you're testing. Role codes that
-- actually exist in prod: 'admin', 'editor', 'sports_secretary' — NOT
-- 'college_admin'/'department_admin' (those are referenced in code but were
-- never seeded; every real scoped admin uses role code 'editor' + scope_type).

-- Global admin:
INSERT INTO public.user_roles (user_id, role_id, scope_type, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='admin'), 'global', 'published');

-- Trust editor (trust_id: a real row from `select id, name from public.trusts`):
INSERT INTO public.user_roles (user_id, role_id, scope_type, trust_id, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='editor'), 'trust', '<trust_id>', 'published');

-- Institute editor (institute_id: `select id, name from public.institutes`):
INSERT INTO public.user_roles (user_id, role_id, scope_type, institute_id, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='editor'), 'institute', '<institute_id>', 'published');

-- College editor (college_id: `select id, name from public.colleges`):
INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='editor'), 'college', '<college_id>', 'published');

-- Department editor (department_id: `select id, name, college_id from public.departments`):
INSERT INTO public.user_roles (user_id, role_id, scope_type, department_id, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='editor'), 'department', '<department_id>', 'published');

-- Sports secretary (section-scoped — role row uses scope_type='college' like
-- a real one does, plus a matching user_section_grants row):
INSERT INTO public.user_roles (user_id, role_id, scope_type, college_id, status) VALUES
  ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1', (SELECT id FROM public.roles WHERE code='sports_secretary'), 'college', '<college_id>', 'published');
INSERT INTO public.user_section_grants (id, user_id, section_id, scope_type, college_id, status) VALUES
  (gen_random_uuid(), 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd3804a1',
   (SELECT id FROM public.admin_sections WHERE code='sports'), 'college', '<college_id>', 'published');
```

Password for all temp accounts above: `Temp#Pass123`.

**Cleanup — run this before ending the session, every time:**

```sql
DELETE FROM auth.identities WHERE user_id IN (/* your temp UUIDs */);
DELETE FROM public.user_section_grants WHERE user_id IN (/* ... */);
DELETE FROM public.user_roles WHERE user_id IN (/* ... */);
DELETE FROM public.user_profiles WHERE id IN (/* ... */);
DELETE FROM auth.users WHERE id IN (/* ... */);
-- Verify zero residue:
select count(*) from auth.users where email like 'temp.%@svitvasad.ac.in';
```

Hard-delete (not soft-delete) any content rows you created to exercise a form (`delete from
public.<table> where <some marker you used, e.g. title = 'ZZZ ...'>`) — a soft-deleted test row left
in Trash is still litter. Prefix every throwaway title/name with `ZZZ Audit` or similar so it's
grep-able and never confused with real content.

### 2.2 Browser automation gotchas (learned the hard way this session)

- **Coordinate-based clicks on this app's form inputs are flaky.** Typing after a coordinate click can
  land in the wrong element (e.g. the background search box behind an open modal, not the modal's own
  field) if the page re-rendered between your screenshot and your click. **Use the native-setter +
  dispatchEvent pattern instead**, run via the browser JS-exec tool:

  ```js
  function setInput(el, val) { // <input> and <textarea>
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function setSelect(el, val) { // <select>
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, val);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  ```
  Scope your query to the actual modal (find it by its heading text, e.g.
  `[...document.querySelectorAll('div')].find(e => e.textContent.trim() === 'Add New Event')`, then
  `.closest('div.fixed')`) rather than `document.querySelector` globally — the background page behind
  an open modal still has its own inputs (search boxes, etc.) that a loose selector can hit instead.

- **The "Analyzing schema & references..." loading state can take 5-10+ seconds** on larger tables
  (`staff_profiles` at 546 rows, `facilities` at 123). Don't conclude a page is broken after a 2-3s
  wait — poll longer first.

- **A dev-server Fast Refresh (HMR) can fire mid-interaction** if a file was just edited, which can make
  a click appear to silently do nothing. If a click seems to do nothing, retry once before assuming it's
  a real bug — check with a raw JS `.click()` call and `await new Promise(r => setTimeout(r, 500))`
  before reading the result, not an immediate read.

### 2.3 Cleanup discipline

Every session ends with: hard-delete every temp account, hard-delete every test content row, confirm
zero residue with a final `select count(*)` sweep. Both prior audits did this; keep doing it.

## 3. "Test everything" — admin panel checklist

For each row below: **(a)** loads without error for a role that should have access, **(b)** Add/Edit/
Delete actually persists via a real round-trip (create a `ZZZ Audit`-prefixed row, verify it in the
table, hard-delete it — not just "the button is visible"), **(c)** the Read-Only badge / nav visibility
matches what RLS actually allows for that role (check `pg_policy`/`pg_trigger` on the table if unsure,
same way both prior audits did).

Full route/table map (routes, `GLOBAL_ONLY_ROUTE_PREFIXES`, `COLLEGE_OR_ABOVE_ROUTE_PREFIXES`,
`admin_sections` codes, every `TABLE_CONFIGS` entry) is already produced in the two prior audits —
don't re-derive it, read `admin-role-audit-2026-10.md` section 2/3/4 first.

**Already tested** (see `admin-role-audit-2026-10.md`): Colleges, Departments, Courses, Facilities,
Centers, Committees, Achievements, Events, Staff Profiles, Board Members, Placed Students, Gallery
Albums (global-only gating). Events/Achievements Add flow specifically re-tested in depth (see the
second audit).

**Not yet tested, checklist for the next pass** (tick off as you go):

- [x] Institutes (Add/Edit/Delete, all scope tiers) — see `institutes-trusts-scope-audit-2026-10.md`
- [x] Trusts (global-only — confirm it's actually blocked for every other role) — see `institutes-trusts-scope-audit-2026-10.md`
- [x] Labs (`/admin/labs` — custom page, not generic `/admin/tables/*`) — Add round-trip OK (stored in `facilities`, department-scoped correctly for a college-scoped admin)
- [x] Designations (global-only) — Add round-trip OK, simple form, no issues
- [x] Staff Posts (global-only) — Add round-trip OK, simple form, no issues
- [x] Posts / Blog & News (global-only) — Add round-trip OK, card-photo widget correct
- [x] Content Categories — empty table (0 rows), `module_type` free-text column unreferenced anywhere in `src/` outside generated types; feature appears unused/dead, not actively broken
- [x] Menus, Menu Items (global-only) — tree loads real nav (just slow, 2-3s), Add/Delete round-trip OK. Note: clicking a delete icon anywhere in this admin fires a native `confirm()` that freezes browser-automation tools; a human had to dismiss it manually mid-session — not a site bug, but worth knowing for future automated passes
- [x] Homepage Layout / `homepage_items` — page loads real data correctly (just slow on first load, same
      pattern as Menus — don't mistake a mid-load screenshot for an empty state). The flagged CHECK-
      constraint gap turns out not exploitable: `AdminHomepagePage.tsx` only ever writes `scope_type`
      'global'/'college' and never includes `department_id` in any payload, so the admin UI can't produce
      the inconsistent-scope row shape that bit events/achievements. Not fixed because not reachable.
- [x] Downloads (`library` section carve-out) — found & fixed `file_type` rendering as a file-upload
      widget (same heuristic bug class as website_url). Add round-trip now OK. **Content finding (not a
      code bug)**: all 8 live Downloads rows have `file_url = '#'` — every public download link is
      currently dead; admin needs to upload real files and set real URLs
- [x] Recruiters (global-only custom page) — Add round-trip OK, website_url fix confirmed
- [x] T&P Master Hub / Placed Students write path (`placement` section carve-out) — Add round-trip OK on both Placed Students tab and the hub's section toggles page
- [x] Accreditations — found & fixed `document_url` rendering as an image uploader (should be file-type,
      same bug class as website_url/file_type); Add round-trip OK after fix
- [x] Board Members — Add round-trip OK, Photo Url correctly an image field
- [x] Committees (`about_us` section carve-out) — found & fixed missing slug autogen (same gap as
      institutes/trusts); also fixed the same gap on `content_categories` and `pages` while in the file.
      Add round-trip OK
- [x] Gallery Albums (global-only, `campus_life` carve-out) — Add round-trip OK, cover image correctly
      image-typed; 116 pre-existing rows, many auto-sourced from facilities/events/achievements/clubs
- [x] Gallery Media — 168 real rows load with real image URLs, data path healthy (did not do a full Add
      round-trip, lower risk since the URL field here is already correctly typed)
- [x] Student Clubs — Clubs & Societies full Add round-trip OK (slug autogen, logo field correct)
- [ ] Sports & Athletics full round-trip (already permission-checked; not yet a live create/delete test)
- [x] Sports & Athletics full round-trip — live Add Sport confirmed (slug silently autogenerates, coach
      photo correctly image-typed)
- [x] MOUs — Add round-trip OK, logo/activities fields correct
- [x] Inquiries Inbox (`admissions` section carve-out) — real inbox data loads correctly (Admission
      Inquiry + Grievance templates), Export CSV button not disabled. Did not create test rows or export
      (inbox holds real applicant PII). "FieldsCount: 9" label on Configure Template Fields reads
      camelCase/dev-ish but the whole card uses a deliberate monospace style — likely intentional, left
      as-is
- [x] Admissions Details (global-only, `admissions` carve-out) — Edit round-trip OK (brochure correctly
      file-typed), reverted test value
- [x] Scholarships — Add round-trip OK
- [x] User Management — found & fixed a severe bug: disabling a user's access made the re-enable button
      disappear forever (visibility condition checked `roles.length + sections.length > 0`, but disabling
      archives all grants, zeroing both). Backend restore logic was already correct; only the button was
      broken. Verified live: disable → button vanishes → fix applied → button reappears → re-enable →
      role fully restored. Did not test Create User (would send a real account-creation flow) or
      Reset Password (would attempt a real email send) — left both unexercised
- [x] Trash (restore flow) — found & fixed two bugs: (1) `institutes`/`trusts`/`pages` were missing from
      the Trash panel's table dropdown entirely, so soft-deleted rows there were unrecoverable; (2)
      Restore only cleared `deleted_at`, never reset `status` from 'archived' back to 'published', so a
      "restored" row stayed invisible on the public site. Both fixed and verified live with a real
      delete→restore→verify round-trip on `institutes`.
- [x] Audit Log — confirmed entries logged correctly across every table touched this session (institutes,
      mous, centers, student_clubs, gallery_albums, committees, board_members, accreditations,
      recruiters, downloads, posts, ...). Table is large (1300+ rows) and slow to first-load (same
      pattern as Menus/Homepage) — don't mistake the loading state for "0 rows"
- [x] Settings / HeroAppearance — both pages (+ Popup tab) load real config correctly with working live
      previews; all URL/image fields correctly typed. Did not Save (shared global config, not a
      test-isolable row — no safe way to revert a live edit here)

## 4. Admin → public site linkage checklist

The explicit ask this playbook exists to serve: confirm a change made in the admin panel actually shows
up on the public site, not just that the admin panel accepted it.

**Method per content type**: open the public page first, note its current state (screenshot or just the
visible text), make a small change in admin (or add a `ZZZ Audit`-prefixed throwaway row), reload the
public page, confirm the change appears, then revert/hard-delete the test change and confirm the public
page reverted too.

| Content type | Admin table(s) | Public route(s) | Data-fetch function | Notes |
|---|---|---|---|---|
| Colleges | `colleges` | `/colleges`, `/colleges/[college]` | `src/lib/colleges.functions.ts` | |
| Departments | `departments` | `/departments/[dept]` | `src/lib/departments.functions.ts` | |
| Courses | `courses` | `/courses`, `/courses/[course]` | `src/lib/programmes.functions.ts` | |
| Facilities | `facilities` | `/campus-life/facilities` | `src/lib/facilities.functions.ts` | |
| Events | `events` | `/campus-life/events`, `/campus-life/events/[slug]`, `/departments/[dept]` (Activities tab) | `src/lib/events.functions.ts`, `src/lib/department-content.functions.ts` | Department Activities tab only shows 6 of 12 `event_type` values — documented, not a bug to re-report |
| Achievements | `achievements` | `/achievements/[slug]` only — **no sitewide listing page exists** | `src/lib/achievements.functions.ts` | A published achievement with no `department_id` or `has_detail_page: false` is effectively unreachable — documented finding, not new |
| Staff Profiles | `staff_profiles`, `staff_department_assignments` | `/staff/[staff]`, department pages | `src/lib/staff.functions.ts` | |
| News/Posts | `posts`, `content_categories` | `/news`, `/news/[slug]` | `src/lib/posts.functions.ts` (check actual filename) | |
| Gallery | `gallery_albums`, `gallery_media` | `/gallery`, `/gallery/[albumId]` | `src/lib/gallery.functions.ts` | |
| Downloads | `downloads` | `/downloads` | check `src/lib/*.functions.ts` for the downloads module | |
| Board Members | `board_members` | `/about/board-of-management` | check `src/lib/*.functions.ts` | |
| Committees | `committees`, `committee_members` | `/about/committees` | check `src/lib/*.functions.ts` | |
| Placements | `placed_students`, `recruiters`, T&P hub tables | placement pages | check `src/lib/*.functions.ts` | |
| Homepage | `homepage_sections`, `homepage_items` | `/` | homepage data-fetch, check `src/lib/*.functions.ts` | |
| Menus | `menus`, `menu_items` | site nav (Header component) | `src/lib/menus.functions.ts` | |
| Search | all of the above | search dropdown (client-side, reads `public/search-index.json`) | `scripts/build-search-index.ts` | **Build-time only** — see caveat below |

### Caching/revalidation traps — don't misdiagnose these as bugs

- **`layout.tsx`'s `.catch(() => fallback)` pattern**: public layouts wrap data fetches in a catch that
  shows fallback/stale content instead of an error when a query fails (per `CLAUDE.md`). If a change
  doesn't appear, check whether the underlying fetch is actually *erroring* (e.g., an RLS policy you
  didn't expect) before concluding "the admin change didn't take" — the failure mode looks identical to
  simple staleness from the visitor's side.
- **Next.js server-component fetch caching**: a public page may be served from Next's fetch cache rather
  than hitting Supabase fresh on every request. A hard refresh / cache-busting navigation may be needed
  to see a just-made change; don't conclude the admin write failed just because the first reload didn't
  show it.
- **Site search is build-time only, always** (`scripts/build-search-index.ts` only runs at `npm run
  build`, per `CLAUDE.md` and confirmed in the events/achievements audit). A content change will never
  show in search results until the next production deploy. This is an already-documented, accepted
  limitation — don't re-report it as a new bug; it's listed here only so a search-staleness observation
  doesn't get misfiled as "admin → site linkage is broken."

## 5. Explicitly out of scope so far — the literal starting list for the next pass

- CSV imports (`faculty-import.ts`, `achievements-import.ts`) — never tested
- Staff profile wizards (`/admin/staff-wizards`) — never tested
- Media upload/compression pipeline (`src/lib/image-compression.ts`, `@jsquash/*`) — never tested;
  `CLAUDE.md` already notes server-side compression is known non-functional (Cloudflare-era)
- HeroAppearance / homepage appearance settings — never tested
- Trash restore flow — nav-checked only (loads), never actually restored something
- Audit Log correctness — only spot-checked for events/achievements triggers, not read end-to-end
- Menus builder — never tested
- Multi-college-grant edge cases — a user holding grants on 2+ colleges simultaneously, never tested
- Institute- and trust-scope role testing beyond the single Events spot-check in the second audit
- The `homepage_items`/`homepage_sections` scope-consistency question flagged in section 3 above
- Everything in section 3's unchecked-checklist

## 6. Format note

This file is meant to be read cold and acted on immediately — keep it a scannable
table/checklist/snippet format, not prose, as you extend it.
