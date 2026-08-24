# Hardcoded Content Audit

> Generated: 2026-08-06
> Status: Ongoing — items marked ✅ are already dynamic, ⚠️ are partially dynamic (DB-driven but fallback hardcoded in code), 🔴 are fully hardcoded.

---

## 1. Admission Year

The current batch year `"2026-27"` is repeated in **7 places**. It exists in `app_settings` (key `admission_year`) but the code never reads it from there — all 7 are still hardcoded.

| File | Location | Usage |
|------|----------|-------|
| `routes/__root.tsx:75` | og:description meta tag | `"Admissions open for 2026-27."` |
| `routes/admissions.index.tsx:10` | `head()` title | `"Admissions 2026-27 — SVIT Vasad"` |
| `routes/admissions.index.tsx:26` | FAQ question | `"When do admissions for 2026-27 open?"` |
| `routes/admissions.index.tsx:36` | PageHero accent | `accent="2026-27 Batch"` |
| `routes/admissions.intake-fees.tsx:46` | PageHero accent | `accent="2026-27"` |
| `routes/admissions.inquiry.tsx:11` | `head()` meta description | `"Submit an admission enquiry for 2026-27"` |
| `routes/admissions.inquiry.tsx:54,82` | PageHero accent + dropdown | `accent="2026-27"`, `<option value="2026-27">` |
| `components/site/CTABanner.tsx:16` | Default prop | `eyebrow = "Admissions Open 2026-27"` |
| `components/site/Carousel.tsx:20` | Hardcoded slide | `eyebrow: "Admissions 2026-27"` |

**Fix:** Read `admission_year` from `miscSettingsQuery` in each route/component loader.
`head()` functions can't call async fns, so meta tags in `head()` need the loader to prefetch and pass the value.

---

## 2. Contact Details (Fallback / Hardcoded)

Contact info is now in `app_settings` but each consumer has hardcoded fallbacks in the source code. If the DB is unreachable these show, but if someone changes the DB data the code fallbacks will silently be stale.

| File | Hardcoded value | What it is |
|------|----------------|-----------|
| `components/site/Header.tsx:6` | `email: "info@svitvasad.ac.in"`, `phone: "+91 2692 274766"` | ⚠️ Fallback constants |
| `components/site/Footer.tsx:9-12` | Same email, phone, address | ⚠️ Fallback constants |
| `routes/admissions.inquiry.tsx:17` | `"+91 2692 274766"` | ⚠️ Inline fallback |
| `routes/student-login.tsx:27` | `it@svitvasad.ac.in` | 🔴 IT support email hardcoded (exists in `misc_settings.it_support_email` but not read here) |
| `routes/careers.tsx` | Uses `contact?.email` from DB | ✅ Dynamic |

**Fix for student-login:** Read `miscSettingsQuery` and use `misc.it_support_email`.
The fallback values in Header/Footer are acceptable as compile-time safety nets but should match the DB values.

---

## 3. OG / Meta Tags (`routes/__root.tsx`)

The global `head()` function in `__root.tsx` has static meta tags that should be dynamic. Since `head()` runs server-side and can call loaders, these can be made dynamic.

| Line | Tag | Current value |
|------|-----|--------------|
| 73 | `<meta name="description">` | `"AICTE-approved...15-acre campus...95% placements..."` |
| 74 | `og:title` | `"SVIT Vasad — Institute of Technology"` |
| 75 | `og:description` | `"Empowering minds, inspiring innovation. Admissions open for 2026-27."` |
| 77 | `og:image` | `https://svitvasad.ac.in/og-image.jpg` |
| 79 | `twitter:image` | `https://svitvasad.ac.in/og-image.jpg` |

**Fix:** Add a `loader` to `__root.tsx` that fetches `miscSettingsQuery` (already prefetches `contactInfoQuery`). Use `misc.og_description`, `misc.og_image_url`, and `misc.admission_year` in `head()`.

---

## 4. Placement / Stats Claims

These numbers appear inline in text and carousel slides. None are linked to the actual placement data in the DB.

| File | Hardcoded stat |
|------|---------------|
| `routes/__root.tsx:73` | `"95% placements"` |
| `routes/index.tsx:93` | `"95%+ placement across 200+ recruiting partners"` |
| `routes/parents.tsx:14` | `"95% placement track record"` |
| `routes/admissions.inquiry.tsx:105` | `"95%+ placement record"` |
| `components/site/CTABanner.tsx:18` | `"200+ active recruiting partners"` |
| `components/site/Carousel.tsx:34,36` | `"95% Placement Record"`, `"200+ recruiting partners including TCS, Infosys, L&T, Adani and Reliance"` |

**Fix options:**
- Add `placement_percentage`, `recruiter_count` to `app_settings` misc settings (already partially done with `og_description`)
- Or pull the top-line stat from the `placement_data` / tnp-hub data
- `"TCS, Infosys, L&T, Adani and Reliance"` should be pulled from the `recruiters` table (featured recruiters query)

---

## 5. Year Established (Conflict)

There is a **direct conflict** between two hardcoded values:

| File | Value | Context |
|------|-------|---------|
| `components/site/Footer.tsx:58` | `since 2005` | Footer tagline |
| `routes/about.history-vision-mission.tsx:13` | `since 1997` | Page meta description |
| `app_settings` | `year_established = 1997` | ✅ Stored in DB |

**Fix:** The footer tagline should read `year_established` from `miscSettingsQuery`. One of the two years (1997/2005) is wrong — resolve with the college and update `app_settings`.

---

## 6. Accreditation Badges in AboutLayout

`components/site/AboutLayout.tsx:42-48` hardcodes three badge strings shown on every department/about page sidebar:

```tsx
AICTE Approved
NBA Accredited
GTU Affiliated
```

The `accreditations` table already stores these records with `status = 'published'`. These should be queried from the DB so adding/removing an accreditation reflects automatically.

**Fix:** Query `getAllAccreditations()` and render `accreditation.organization` as badges. Or add a `show_in_sidebar boolean` column to the `accreditations` table.

---

## 7. Admissions FAQs (`routes/admissions.index.tsx:25-30`)

Four FAQ entries are hardcoded as a JS array:

```js
const faqs = [
  { q: "When do admissions for 2026-27 open?", a: "Applications open in January 2026..." },
  { q: "Are scholarships available?", a: "Yes — merit-based, need-based..." },
  { q: "What documents are required?", a: "..." },
  { q: "How do I get a fee breakdown?", a: "..." },
];
```

**Fix:** Add a `faqs` table (or store as a JSONB key in `pages` table under slug `admissions`). The `pages` table with `metadata` is already used for about/alumni page content — same pattern applies here.

---

## 8. Admissions Process Steps (`routes/admissions.index.tsx:17-23`)

Four process steps are hardcoded:

```js
{ n: "01", title: "Register Online", desc: "..." },
{ n: "02", title: "Eligibility Check", desc: "..." },
{ n: "03", title: "Merit List", desc: "..." },
{ n: "04", title: "Fee Payment", desc: "..." },
```

**Fix:** Same as FAQs — store in `pages` metadata under slug `admissions`, or in a dedicated `content_blocks` table.

---

## 9. College Nav Visibility (`components/site/Header.tsx:74`)

Colleges to hide from the navigation are controlled by a hardcoded array:

```ts
const EXCLUDED_SLUGS = ["abc123", "thesilicon", "the-silicon", "overview"];
```

**Fix:** Add a `show_in_navigation boolean DEFAULT true` column to the `colleges` table. Filter with `.eq('show_in_navigation', true)`. The admin college editor should expose this toggle.

---

## 10. Campus Size / Infrastructure Claims

| File | Hardcoded claim |
|------|----------------|
| `routes/__root.tsx:73` | `"15-acre campus"` |
| *(mentioned in about page content but that's in the DB)* | |

**Fix:** Either add `campus_size_acres` to misc settings, or keep this in the `pages` table under the `about` page metadata (which it already is for detailed content).

---

## 11. Carousel Slide Data (`components/site/Carousel.tsx:17-45`)

The Carousel has **3 hardcoded fallback slides** that show when `homepage_items` returns nothing:

```ts
{ eyebrow: "Admissions 2026-27", title: "Shape Your Future...", ... },
{ eyebrow: "95% Placement Record", title: "Industry-Ready Graduates", ... },
{ eyebrow: "Campus Life", title: "Vibrant Community", ... },
```

The actual slides are DB-driven via `homepage_items` (type `carousel_slide`). These fallbacks would only show if the DB is empty, but they contain stale data.

**Fix:** Either remove hardcoded fallbacks (show empty state instead) or update them whenever `admission_year` / placement stats change.

---

## 12. Social Share / Twitter Card (`routes/__root.tsx`)

- `og:image` and `twitter:image` both point to `https://svitvasad.ac.in/og-image.jpg` — a URL that may not exist.
- `og_image_url` is now in `app_settings` (set to `null` by default) but not yet wired into `__root.tsx`.

---

## Summary by Priority

| Priority | Item | Effort |
|----------|------|--------|
| 🔥 High | Admission year (7+ files) | Medium — loader changes needed |
| 🔥 High | Year established conflict (1997 vs 2005) | Low — fix Footer.tsx, decide the year |
| 🔥 High | OG image URL in `__root.tsx` | Low — wire `og_image_url` from settings |
| 🟡 Medium | OG/meta description in `__root.tsx` | Medium — needs loader |
| 🟡 Medium | Placement % & recruiter count claims | Medium — add to misc settings |
| 🟡 Medium | College nav exclusion (EXCLUDED_SLUGS) | Medium — add DB column |
| 🟡 Medium | Accreditation badges in AboutLayout | Medium — query from DB |
| 🟢 Low | Admissions FAQs & process steps | High — needs `faqs` table or pages metadata |
| 🟢 Low | Carousel fallback slides | Low — update or remove |
| 🟢 Low | IT support email in student-login | Low — read from misc settings |
| 🟢 Low | "TCS, Infosys, L&T…" recruiter names | Low — query featured recruiters |

---

## Already Made Dynamic (for reference)

| Item | Where stored |
|------|-------------|
| Contact info (phone, email, address, social links) | `app_settings` key `contact_info` |
| Anti-ragging email | `app_settings` key `antiragging_email` |
| UGC helpline | `app_settings` key `ugc_helpline` |
| IT support email | `app_settings` key `it_support_email` |
| OG description | `app_settings` key `og_description` |
| OG image URL | `app_settings` key `og_image_url` |
| Year established | `app_settings` key `year_established` |
| Admission year | `app_settings` key `admission_year` |
| Hero images / appearance | `app_settings` key `hero_appearance` |
| Image compression mode | `app_settings` key `image_compression_mode` |
| Events, news, clubs, sports, facilities | Respective Supabase tables |
| Staff, departments, courses, colleges | Respective Supabase tables |
| Placement data, recruiters | Respective Supabase tables |
| Job listings | `homepage_items` (type `job_listing`) |
| FAQs for admissions | 🔴 Not yet — still hardcoded |
