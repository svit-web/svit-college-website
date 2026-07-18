# Homepage → Database Schema Plan

Goal: make every section of the homepage (`src/routes/index.tsx`) editable from Lovable Cloud instead of hard-coded in `src/data/*.ts`. Below is the recommended set of tables, mapped 1:1 to the sections currently rendered on `/`.

## Sections on the homepage today
1. **Hero** — eyebrow, headline, highlighted phrase, subtitle, quick-link chips, primary/secondary CTAs, background image
2. **Hero Card Slider** — right-side auto-advancing photo cards
3. **Our Colleges** grid — 4 constituent colleges
4. **Home Carousel** — full-width rotating banners
5. **Stats Strip** — 6 numeric stats
6. **Why SVIT** — feature cards with icon + title + description
7. **Trust Band** — badges (AICTE, NAAC, etc.)
8. **Events & News** — latest items list
9. **Admissions Open** promo card
10. **Quick Enquiry** form (writes to DB)
11. **Recruiters** logo/text strip
12. **CTA Banner** ("Begin Your Journey")

## Proposed tables

| # | Table | Purpose | Key columns |
|---|-------|---------|-------------|
| 1 | `home_hero` | Singleton row for the hero block | `eyebrow`, `title`, `title_accent`, `subtitle`, `bg_image_url`, `primary_cta_label`, `primary_cta_href`, `secondary_cta_label`, `secondary_cta_href` |
| 2 | `hero_quick_links` | Chips under hero subtitle | `label`, `href`, `sort_order`, `is_active` |
| 3 | `hero_highlights` | Right-column slider cards | `image_url`, `eyebrow`, `title`, `subtitle`, `sort_order`, `is_active` |
| 4 | `home_carousel_slides` | Full-width rotating banner | `image_url`, `eyebrow`, `title`, `subtitle`, `cta_label`, `cta_href`, `sort_order`, `is_active` |
| 5 | `colleges` | The 4 constituent colleges | `slug`, `short_code`, `name`, `tagline`, `logo_url`, `sort_order` |
| 6 | `site_stats` | Stats strip numbers | `label`, `value`, `sort_order` |
| 7 | `why_choose_items` | "Why SVIT" cards | `icon_name` (lucide key), `title`, `description`, `sort_order` |
| 8 | `trust_badges` | AICTE / NAAC etc. | `label`, `icon_name`, `sort_order` |
| 9 | `events` | Events & news list | `title`, `tag`, `event_date`, `body`, `link_href`, `is_published`, `sort_order` |
| 10 | `promo_cards` | Reusable side promos (Admissions Open, CTA banner) | `slot` (enum: `home_admissions`, `home_cta_banner`), `eyebrow`, `title`, `body`, `cta_label`, `cta_href`, `image_url` |
| 11 | `recruiters` | Recruiter names/logos | `name`, `logo_url` (optional), `sort_order` |
| 12 | `enquiries` | Form submissions (write-only from site) | `full_name`, `email`, `mobile`, `programme_interest`, `created_at`, `status` |

## Access model
- Public read (`TO anon SELECT`) on tables 1–11 with `is_active = true` / `is_published = true` filters.
- `enquiries`: `INSERT` allowed to `anon`; `SELECT`/`UPDATE` restricted to admin role only.
- All admin writes gated by a `has_role(auth.uid(), 'admin')` policy backed by the standard `user_roles` table.

## Frontend integration pattern
- One server function per section (`getHomeHero`, `listColleges`, `listEvents`, …) using the server publishable client for public data.
- Route loader calls `queryClient.ensureQueryData(...)` for each section in parallel; components read via `useSuspenseQuery`.
- Existing `src/data/*.ts` files become fallback seed data only; new migrations seed the tables with the current hard-coded values so the site looks identical on first load.

## Questions before I build
1. Do you want **all 12** sections DB-backed, or only a subset (e.g. hero + events + colleges) for now?
2. Should there be an **admin dashboard route** (`/admin`) to edit these, or will you edit rows directly via the Cloud table view for now?
3. `enquiries` — send email notification on submit, or just store in DB?

Once you confirm, I'll enable Lovable Cloud, write the migrations (with seed data from the current files), and wire the loader + components.
