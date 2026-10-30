# 12 — Per-college hero photos & vision/mission; mobile sub-menus; recent-only menus

## College pages (`/colleges/[college]`)
- **Hero photos per college**: a slideshow (crossfade every 5 s when the Hero Appearance
  slider is on) from `colleges.metadata.hero_photos`. Without photos it falls back to the
  college's (or global) "Hero Section" homepage item image, as before. Photo look
  (visibility, tint, blur, fade) still comes from Hero Appearance.
- **Vision & Mission per college**: new section after Programmes, from
  `colleges.metadata.vision` and `colleges.metadata.mission_points`. Hidden while both are empty.
- Admin: **`/admin/homepage` → College Pages** tab. Pick a college, add/reorder/remove hero
  photos, type the vision and the numbered mission points, Save. Other metadata keys are kept.
- No migration: uses the existing `colleges.metadata` column and its RLS.

## Mobile menu (`MobileNavPanel.tsx`)
- Every second-level row now expands in place like colleges → departments did:
  Campus Life categories (Facilities, Sports, Student Groups, Events, CoE…), named link
  groups in links menus, and plain menu items that have sub-items (previously their
  sub-items were not shown on mobile). One second-level row open at a time.
- Each Campus Life category ends with its "All … →" link.

## Recent items only in the Campus Life menu (desktop + mobile)
- Events: the 6 newest by start date. Facilities, Sports, Student Groups: the 8 most
  recently added. "View all" covers the rest. Limits in `src/lib/nav-limits.ts`.
- The site layout now sends only the 6 newest events to the header (smaller page payload).

## Verify
1. `/admin/homepage` → College Pages → pick a college → add 2 photos + vision + 2 mission
   points → Save → `/colleges/<slug>` shows the slideshow and the Vision & Mission section.
2. Phone width → menu → Campus Life → tap the chevron on Events → up to 6 events + "All events →".
3. Desktop Campus Life mega menu → Events shows at most 6.
