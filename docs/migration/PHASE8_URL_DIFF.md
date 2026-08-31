# Phase 8 — URL diff against Phase 0 baseline

**Date:** 2026-08-25
**Method:** `next build && next start -p 3111` (dev Supabase), then
`scripts/capture-baseline-html.sh http://127.0.0.1:3111 docs/baseline/urls.txt` against
all 460 URLs from `docs/baseline/urls.txt`, diffed against the committed
`docs/baseline/metadata.tsv`.

## Result: no regressions

- **460 / 460 URLs captured**, 0 capture errors.
- **HTTP status changes: 0** — every URL that was 200/404/redirect in the Phase 0 baseline
  is still 200/404/redirect identically today, including the 7 intentional
  `/courses/*/faculty` tombstone 404s and the 5 `/placement/*` → `/placement` redirects.
- **Redirect target changes: 0.**
- **Canonical regressions: 0**, **JSON-LD regressions: 0** (both were 100% missing in the
  Phase 0 baseline and remain a known Phase 5 gap — not yet implemented, not regressed).
- **Title changes: 327** — all improvements, not regressions. Verified specifically: zero
  cases where a page that had a specific title in the baseline now falls back to the
  generic homepage title. The changes are exactly the Phase 5 `generateMetadata` work:
  every department sub-page (about/staff/labs/achievements/activities) now gets a unique,
  specific title instead of inheriting one generic per-department title, and the intentional
  404 tombstones correctly show no meaningful title change.

## What this does not cover

- Only checked against **dev** Supabase content, per the Phase 0 baseline's own caveat.
  Prod (`rpspvheghvtlaznricmr`) has minor content drift (`homepage_items` 84 vs 85,
  `app_settings` 14 vs 15) — re-run this diff against prod data before the actual cutover.
- No Lighthouse comparison run (needs measurement against the same region as the Phase 0
  baseline per the plan's region caveat — dev is Sydney, prod is Tokyo).
- Canonical `<link>` tags and JSON-LD structured data are still not implemented anywhere
  (pre-existing Phase 5 gap, not something this diff introduced).
