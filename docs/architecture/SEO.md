# SEO & sitemap

How search-engine and social-share metadata works on the public site, what was
done in the October 2026 SEO pass (commit `881f2be`), and what to do when you
add a page.

## Summary

| Area | Where | Notes |
| --- | --- | --- |
| Sitemap | `src/app/sitemap.ts` → `/sitemap.xml` | Built per request from Supabase (`force-dynamic`) |
| Robots | `src/app/robots.ts` → `/robots.txt` | Allows all, disallows `/admin`, points at the sitemap |
| Site-wide metadata | `src/app/layout.tsx` (`generateMetadata`) | `metadataBase`, default title/description, OG + Twitter base |
| Shared helpers | `src/lib/seo.ts` | `SITE_URL`, `siteOpenGraph()`, `metaDescription()`, `parseRobots()`, JSON-LD builders |
| JSON-LD renderer | `src/components/site-next/JsonLd.tsx` | Escapes `<` so DB content can't break out of the script tag |
| Admin noindex | `src/app/admin/layout.tsx` | `robots: noindex, nofollow` on every admin route |
| Per-page metadata | each `page.tsx` (`metadata` / `generateMetadata`) | Title, description, canonical |

The old hand-written `public/sitemap.xml` and `public/robots.txt` were deleted.
Don't recreate them: a file in `public/` would conflict with the generated routes.

## Site URL

`SITE_URL` in `src/lib/seo.ts` is `process.env.NEXT_PUBLIC_SITE_URL`, falling back to
`https://svitvasad.ac.in` (trailing slashes stripped). It is used for:

- `metadataBase` in the root layout, so the relative canonical and OG image paths
  pages return become absolute.
- Every URL in the sitemap, plus the `Sitemap:`/`Host:` lines in robots.txt.
- JSON-LD `url` and `@id` values.

Set `NEXT_PUBLIC_SITE_URL` on preview deployments if you want canonicals and the
sitemap to point at the preview host. Production needs no setting.

## Sitemap (`src/app/sitemap.ts`)

### How it's built

1. **Fixed routes**: the `STATIC_ROUTES` array (path, priority, changefreq).
2. **Dynamic routes**: one Supabase query per table, run in parallel with the
   anon client (`publicSupabase()`), so RLS public-SELECT policies apply.
3. Each query **mirrors the filters of that page's own loader**, so the sitemap
   never lists a URL that would 404:

| URL pattern | Source | Filters (on top of `status='published'`, `deleted_at IS NULL`) |
| --- | --- | --- |
| `/colleges/{slug}` | `colleges` | n/a |
| `/departments/{code}` | `departments` | n/a |
| `/departments/{code}/staff` | `departments` | always listed |
| `/departments/{code}/labs` | `facilities` | only if the dept has a published lab with a detail page |
| `/departments/{code}/activities` | `events` | only if the dept has events of an `ACTIVITY_EVENT_TYPES` type |
| `/departments/{code}/achievements` | `achievements` | only if the dept has achievements with a detail page |
| `/departments/{code}/labs/{slug}` | `facilities` | `facility_type='laboratory'`, `has_detail_page`, dept set |
| `/courses/{code}` | `courses` | `is_programme`, `department_id IS NULL` |
| `/programs/{id}` | `courses` | `department_id IS NOT NULL` |
| `/news/{slug}` | `posts` | n/a (expired posts still resolve, so they stay listed) |
| `/campus-life/events/{slug}` | `events` | `has_detail_page` |
| `/campus-life/clubs/{slug}` (+ `/events`) | `student_clubs` | `has_detail_page` |
| `/campus-life/facilities/{category}/{slug}` | `facilities` | `has_detail_page`, `department_id IS NULL`, category `academic`/`amenities` |
| `/student-corner/{slug}` | `centers` | `has_detail_page`, excluding `CENTERS_WITH_OWN_PAGE` (`coe`, `nss-ncc`) |
| `/gallery/{slug}` | `gallery_albums` | `show_in_public_gallery` |
| `/staff/{employee_code}` | `staff_profiles` | `employee_code IS NOT NULL` |
| `/achievements/{slug}` | `achievements` | `has_detail_page` |

`CENTERS_WITH_OWN_PAGE` and `ACTIVITY_EVENT_TYPES` are imported from
`centers.functions.ts` and `department-content.functions.ts`, not copied, so the
sitemap and the pages can't drift apart.

`lastModified` comes from each row's `updated_at`. Fixed routes have none.

### Freshness and failure behaviour

- `export const dynamic = 'force-dynamic'`: there is no build-time snapshot and no
  cache. Anything published in the admin panel appears on the next crawl.
- If one table query fails, `rows()` logs it and drops only that section. The
  sitemap still returns 200 with everything else.

### Deliberately excluded

- `/admin/*`: also disallowed in robots and `noindex`.
- `/student-login`: placeholder page ("integration in progress"), set to `noindex`.
- Redirect-only routes: `/about`, `/placement/[college]`, `/courses/engineering/[dept]`
  and its `/faculty`, plus the legacy redirects in `next.config.ts` (`/campus`,
  `/alumni`, `/student-corner`, `/campus-life/clubs`, …).
- `/courses/[course]/faculty`: always `notFound()`.

At the time of writing the sitemap had 575 URLs, 414 of them staff profiles. The
protocol limit is 50,000 URLs per file. If the site ever approaches that, split it
with `generateSitemaps` (see `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-sitemaps.md`).

## Page metadata

### Inheritance model (important)

Next.js merges `Metadata` objects from layouts and the page **shallowly**: a key
set by a child replaces the parent's value for that key entirely. The setup relies on this:

- The **root layout** sets `openGraph` with `type`, `siteName`, `locale` and `images`,
  but **no title or description**. Next then fills `og:title`/`og:description` (and the
  Twitter equivalents) from each page's own `title`/`description`. So a page that
  only sets `title` + `description` gets correct share tags for free.
- A page that sets its own `openGraph` **loses** the root's image and site name
  unless it spreads the base: `openGraph: { ...(await siteOpenGraph()), ... }`.
  News and event detail pages do this.
- **Layouts must not set `openGraph` titles or `alternates.canonical`**, because
  every child page without its own value would inherit them. This bug existed: the
  department layout's `og:title` leaked onto `/departments/X/staff` etc., and the
  about layout's onto every `/about/*` page. Both were removed.

### Site-wide defaults (root layout)

| Field | Value |
| --- | --- |
| `title` | `SITE_NAME` ("SVIT Vasad — Sardar Vallabhbhai Institute of Technology") |
| `description` | Admin → Settings → **Site Meta Description** (`app_settings.meta_description`) |
| `og:image` / `twitter:image` | Admin → Settings → **OG Image** (`app_settings.og_image_url`), else `/og-image.jpg` |
| `og:site_name`, `og:locale` | `SITE_NAME`, `en_IN` |
| `twitter:card` | `summary_large_image` |

The home page adds `canonical: "/"`, and its `og:description` comes from Admin →
Settings → **OG / Social Description** (`app_settings.og_description`).

### Canonical URLs

Every indexable public page sets `alternates: { canonical: "/path" }`. Dynamic
pages build it from the **database value**, not the raw URL param, which collapses
duplicates:

- `/departments/ce` and `/departments/CE` → canonical `/departments/CE` (the
  loader upper-cases the param).
- `/campus-life/facilities/anything/library` → canonical
  `/campus-life/facilities/{facility.category}/library` (the catch-all route only
  reads the last segment).

### Descriptions

`metaDescription(text)` in `seo.ts` turns admin-entered rich text (HTML/markdown)
into plain text, collapses whitespace and trims to about 155 characters on a word
boundary. It returns `undefined` for empty input, so the page inherits the site
default instead of emitting an empty tag. Use it for any description that comes
from the database (`description`, `about`, `bio`, `summary`, …).

Pages with no natural description text get a generated one, for example staff:
"{name}, {designation}, {department} at SVIT Vasad."

### Admin per-item SEO overrides (news & events)

`posts` and `events` have a `seo_id` → `seo_metadata` row, edited in the admin
CRUD form via `SeoEditor`. Both loaders embed it with `SEO_OVERRIDE_SELECT`. The
detail pages honour:

| `seo_metadata` column | Effect (fallback) |
| --- | --- |
| `meta_title` | `<title>` (default "{title} — News/Events — SVIT Vasad") |
| `meta_description` | description (default `metaDescription(summary/description)`) |
| `og_title`, `og_description` | OG/Twitter title + description |
| `og_image_url` | share image (default the item's `card_photo_url`, then the site image) |
| `canonical_url` | canonical (default `/news/{slug}` / `/campus-life/events/{slug}`) |
| `robots_directives` | parsed by `parseRobots()`: "noindex"/"nofollow" substrings |

`meta_keywords`, `twitter_card` and `structured_data` are stored but not used.
Search engines ignore keywords, and the card type is site-wide.

### Robots / noindex

- `src/app/admin/layout.tsx`: `noindex, nofollow` on all admin routes, including
  login. robots.txt also disallows `/admin`, but a disallow alone doesn't stop a
  linked URL from being indexed. The meta tag does.
- Not-found branches in `generateMetadata` return `robots: { index: false }`.
- `/student-login` is `noindex, follow`.

## Structured data (JSON-LD)

| Schema | Where | Built by |
| --- | --- | --- |
| `CollegeOrUniversity` (the institute, `@id` = `{SITE_URL}/#organization`) | every public page, via `(site)/layout.tsx` | `organizationJsonLd()`: phone, email, address and social links from Admin → Settings contact info; logo = SVIT college logo |
| `CollegeOrUniversity` (each college) | `/colleges/[college]` | inline. `parentOrganization` references the institute `@id` |
| `NewsArticle` | `/news/[slug]` | `newsArticleJsonLd()` |
| `Event` | `/campus-life/events/[slug]` (when `start_date` is set) | `eventJsonLd()`: offline event at the Vasad campus |

Render with `<JsonLd data={...} />`. Validate changes with Google's Rich Results
Test or validator.schema.org.

## Checklist: adding a new public page

1. Export `metadata` or `generateMetadata` with a `title` ("… — SVIT Vasad"), a
   `description` (through `metaDescription()` if it comes from the DB), and
   `alternates: { canonical: "/your/path" }` built from DB values.
2. Don't set `openGraph` unless you need a custom image or type. If you do, spread
   `await siteOpenGraph()` first.
3. In a layout, never set a canonical or an OG title.
4. Add the route to the sitemap: a fixed route goes in `STATIC_ROUTES`. A dynamic
   route gets a query that uses **exactly** the loader's filters (reuse exported
   constants rather than copying them).
5. Detail pages for a not-found item: return `robots: { index: false }` from
   `generateMetadata` and call `notFound()` in the page.
6. If you rename or remove a route, add a permanent redirect in `next.config.ts`
   and remove it from the sitemap.

## Verifying

```bash
npm run dev
curl -s localhost:3000/robots.txt
curl -s localhost:3000/sitemap.xml | grep -c "<loc>"
# head tags of a page
curl -s localhost:3000/news/<slug> | grep -oE '<title>[^<]*|<link rel="canonical"[^>]*>|<meta (name|property)="(description|robots|og:[a-z_:]+|twitter:[a-z]+)"[^>]*>'
```

To check every sitemap URL resolves, rewrite the `<loc>` host to localhost and
curl each one. Run them one at a time in dev: parallel requests can cause a
spurious webpack "`__webpack_modules__[moduleId] is not a function`" 500 while
routes compile.

## Owner / ops actions (outside the codebase)

- [ ] Upload a 1200×630 campus photo in Admin → Settings → **OG Image**. The
      current value is the SVIT logo, which looks poor in link previews.
- [ ] Verify the domain in Google Search Console and submit
      `https://svitvasad.ac.in/sitemap.xml`. Optionally do the same in Bing Webmaster Tools.
- [ ] After cutover, check that the old site's URLs either match or are covered by
      the redirects in `next.config.ts` (see `docs/migration/PHASE8_URL_DIFF.md`).
- [ ] Keep Admin → Settings → contact info and social links accurate. They feed
      the organisation JSON-LD.

## Known gaps / ideas

- No `BreadcrumbList` JSON-LD (the pages render visual breadcrumbs).
- No `Person` JSON-LD on staff profiles.
- No image sitemap entries (the `images` field of `MetadataRoute.Sitemap`) for
  gallery albums. There are currently 0 public albums.
- No per-page `seo_metadata` override for colleges, departments or static pages.
  Only posts and events have a `seo_id` that the public site reads (`pages.seo_id`
  exists in the DB but no public route uses it).
- Programme pages (`/courses/{code}`) use `courses.description` raw from the DB.
  Make sure admins fill it in, or the page falls back to "{name} at SVIT Vasad."
