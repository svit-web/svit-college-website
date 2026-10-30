# 01 — Central Library in Campus Life navigation

**Why:** Central Library had no entry in the Campus Life navigation.

## Changes
- **Main menu → Campus Life mega panel:** new left-rail item **Central Library**
  (book icon) directly below *Facilities*, always visible like *Centre of
  Excellence* and *NSS / NCC*. Also in the mobile menu (shared category list).
- **Campus Life tab bar:** new **Central Library** tab right after *Facilities*.
- Both link to `/campus-life/central-library` (change 02). The library item in
  the Facilities list links there too.

## Files
- `src/components/site-next/nav/CampusMegaPanel.tsx` — new `central-library` category; `facilityHref()` sends the library facility to the dedicated page.
- `src/components/site-next/CampusLifeNav.tsx` — new tab.
- `src/lib/library-paths.ts` (new) — `LIBRARY_PATH`, `LIBRARY_FACILITY_SLUG`; client-safe (no Supabase imports) so nav components can use them.

## Verify
Hover *Campus Life* in the header: *Central Library* sits under *Facilities*. On any
`/campus-life/*` page the tab bar shows *Central Library* after *Facilities*.
