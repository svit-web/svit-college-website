# Homepage → Lovable Cloud (Dynamic Content)

Wire `src/routes/index.tsx` to fetch content from the DB per the uploaded integration guide, keeping current `src/data/*.ts` values as seed + fallback.

## 1. Enable Lovable Cloud
Turn on Cloud so we get the Supabase-backed DB, generated client, and types.

## 2. Schema (single migration)

Unified `homepage_items` + shared lists. All tables get `GRANT SELECT TO anon, authenticated`; writes to `service_role` only. RLS enabled with a public read policy filtered by `is_active` / `status = 'published'`.

Tables:
- `homepage_items` — unified content table (see guide §1). Columns: `id uuid pk`, `scope_type scope_level default 'global'`, `department_id uuid null`, `item_type text`, `eyebrow`, `title`, `title_accent`, `subtitle`, `body`, `image_url`, `icon_name`, `link_href`, `link_label`, `secondary_link_href`, `secondary_link_label`, `sort_order int default 0`, `is_active bool default true`, `status content_status default 'published'`, `metadata jsonb default '{}'`, timestamps. Enums: `scope_level`, `content_status`. Index on `(scope_type, item_type, is_active, sort_order)`.
- `colleges` — `id, slug unique, name, tagline, logo_url, sort_order`.
- `recruiters` — `id, name, logo_url, sort_order`.
- `events` — `id, title, tag, start_date, description, registration_link, status, sort_order`.
- `posts` — `id, slug unique, title, summary, featured_image_url, published_at, status`.

## 3. Seed data
Same migration inserts current values from:
- `src/data/site.ts` → stats, whyChoose, events, recruiters, trust badges, hero copy.
- `src/data/heroHighlights.ts` → highlight_card rows.
- `src/data/colleges.ts` → colleges rows (using existing CDN logo URLs).
- Carousel slides from `Carousel.tsx` data.
- Two `promo_card` rows tagged with `metadata->>'slot'` = `home_admissions` and `home_cta_banner`.

## 4. Data layer

New files:
- `src/lib/homepage.functions.ts` — server functions using the server publishable client:
  - `getGlobalHomepageItems()`
  - `getCollegesGrid()`
  - `getRecruiterLogos()`
  - `getLatestEvents(limit=4)`
  - `getLatestPosts(limit=4)`
- `src/lib/homepage.ts` — query options + `groupHomepageItems(items)` helper that buckets by `item_type` and extracts the singleton `hero`, plus a `promoBySlot(items, slot)` lookup.

## 5. Refactor `src/routes/index.tsx`
- Loader primes all 5 queries via `queryClient.ensureQueryData` in parallel.
- Sections consume `useSuspenseQuery` and read from the grouped map.
- Each section falls back to the existing static data if the query returns empty or throws (per guide §4). Keeps site looking identical on first paint even before DB is populated.
- `CollegesSection` uses `colleges` table (falls back to `src/data/colleges.ts` for logo mapping if `logo_url` is null).
- `HeroCardSlider` accepts a `highlights` prop; homepage passes DB rows and it falls back to `heroHighlights` static list.
- `HomeCarousel` accepts a `slides` prop with the same fallback pattern.
- `CTABanner` reads the `home_cta_banner` promo row.

Icons: `icon_name` is looked up against a small whitelist map (`BadgeCheck`, `GraduationCap`, `Briefcase`, `Building2`, `Users`, `Lightbulb`, `Award`, `Trees`, `ShieldCheck`) — unknown names fall back to `BadgeCheck`.

## 6. Out of scope (this pass)
- `important_link` / `popup_announcement` modals — schema included and seeded empty; UI not wired yet.
- Admin editing UI — edits happen via Cloud table view.
- `enquiries` table / form persistence — form stays local-only (toast).
- Other pages (About, Placement, Departments, Campus Life) stay static.

## Technical notes
- Server functions use the `sb_`-key `fetch` shim from the server-fn knowledge (opaque publishable keys aren't JWTs).
- Only safe/public columns are selected; `homepage_items` public read policy requires `is_active AND status='published'`.
- Loader is on a public route (`/`), so no auth middleware — all fns are unauthenticated public reads.
