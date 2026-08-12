# Phase 0 baseline

Captured 2026-08-12 against **dev** Supabase (`agezrfclusigfqysbxwb`) on branch `nextjs-migration`.

This is the diff target for the Phase 8 cutover check. Regenerate with
`scripts/build-url-inventory.sh`. See `docs/NEXTJS_MIGRATION_PLAN.md` §5.

## Files

| File | Contents |
|---|---|
| `urls-static.txt` | 31 URLs derived from `src/routes/*.tsx` (flat-dot naming, layouts excluded) |
| `urls-dynamic.txt` | 429 URLs expanded from Supabase (published, not soft-deleted) |
| `urls.txt` | 460 — the full inventory, and the Phase 8 diff target |
| `urls-sitemap.txt` | 42 URLs parsed from the committed `public/sitemap.xml` |

## Inventory

```
static      31
dynamic    429
TOTAL      460
```

Dynamic breakdown: 249 staff profiles · 70 department pages (14 departments × 5 views)
· 50 campus-life (clubs, club events, events, facilities) · 32 programs · 15 course pages
· 9 student-corner · 5 colleges · 5 placement redirects · 3 gallery albums.

## What the sitemap diff revealed

The committed `public/sitemap.xml` lists **42** URLs against **460** that actually resolve.

**420 live URLs are absent from the sitemap** — every one of the 249 staff profiles, 57 of
the 70 department pages, 47 campus-life pages, and all 32 program pages. These are
invisible to search engines except via internal-link discovery.

**2 sitemap entries do not resolve:**

| URL | Why |
|---|---|
| `/contact` | No such route exists in `src/routes/` |
| `/colleges/svit-diploma` | Not among the 4 published rows in `colleges` |

Both have been advertised to crawlers as valid.

This quantifies Phase 5's `app/sitemap.ts` work: a generated sitemap takes coverage from
42 to 460 and cannot drift again. It is also the clearest evidence that the SEO gaps are
real and independent of the framework choice — the same fix applies to TanStack Start.

## Rendered HTML capture

`scripts/capture-baseline-html.sh` fetched all 460 URLs from a local production build
(`NITRO_PRESET=node-server`) against dev Supabase. Full HTML lives in `html/` (16MB,
gitignored); `metadata.tsv` holds the extracted per-URL SEO fields and **is committed** —
it is the Phase 8 diff target.

```
460 URLs captured   453 × 200   7 × 404   5 redirects   0 errors
```

### The 7 × 404 are intentional

`/courses/{architecture,bba,bsc,diploma,engineering,mba,mca}/faculty` all 404 because
`src/routes/courses.$course.faculty.tsx` unconditionally throws `notFound()` — a
deliberate tombstone route. They stay in the inventory so Phase 8 verifies Next.js
still returns 404 rather than accidentally rendering something.

### The 5 redirects must be preserved

| From | To |
|---|---|
| `/about` | `/about/history-vision-mission` |
| `/placement/svica`, `/svion`, `/svit-coa`, `/svit-degree` | `/placement` |

### SEO coverage measured across all 460

| Field | Missing |
|---|---|
| `<title>` | 0 |
| `<meta description>` | 1 |
| `og:title` | 0 |
| **`<link rel=canonical>`** | **460 (100%)** |
| **JSON-LD** | **460 (100%)** |
| `<h1>` | 25 |

### The headline finding: 453 pages, 141 unique titles

**All 249 staff profile pages emit the homepage's title** —
`SVIT Vasad — Sardar Vallabhbhai Institute of Technology` — because
`src/routes/staff.$staff.tsx` defines no `head()`. Every faculty profile is a
duplicate-title page to a crawler, and 25 of them have no `<h1>` either.

This is the concrete cost of the 15 routes missing `head()`, and it is by far the
largest single SEO defect on the site. It is also **entirely fixable on the current
stack** — it needs a `head()` function, not Next.js.

## Caveats

- Counts reflect **dev** data. Prod (`rpspvheghvtlaznricmr`) has minor content drift
  (`homepage_items` 84 vs 85, `app_settings` 14 vs 15), so its inventory will differ
  slightly. Regenerate against prod before the Phase 8 comparison.
- `/campus-life/facilities/*` is served by a splat route whose loader keys on the **last**
  path segment. The inventory lists the single-segment form; if the UI links to
  `/campus-life/facilities/<category>/<slug>`, those longer forms resolve too and must be
  captured before cutover.
