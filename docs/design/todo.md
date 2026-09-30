# Beige Redesign — Site-wide Plan

Bring every public page onto the beige editorial theme. The **homepage is done** and is the canonical
reference; the rules live in [`BEIGE_DESIGN_SYSTEM.md`](./BEIGE_DESIGN_SYSTEM.md) — read it before
starting any phase. Plan written 2026-09-29.

**Order:** shared components first (Phases 0–6), then page by page (Phase 7), then leftovers and
release (8–9). Most pages change "for free" once Phases 0–3 land; Phase 7 is the per-page cleanup.

**Every item, every phase:**
- Style only — never hardcode content the admin panel edits; no data-layer changes unless stated.
- Check at **360 / 390 / 768 / 1024 / 1440** px (Playwright + `/usr/bin/google-chrome`), before and after.
- Run `CHROME_PATH=/usr/bin/google-chrome node scripts/mobile-audit.mjs <paths>` on every touched page:
  no horizontal overflow; tap targets ≥44px for controls (buttons, pills, tabs), ≥24px for inline links.
- `npx tsc --noEmit` + `npx eslint <changed files>` clean for touched lines.
- Admin must not regress (CLAUDE.md).

Legend for audit counts (from the 2026-09-29 scan): `r` rounded-lg/xl/2xl · `lift` card-lift ·
`navy` navy background · `grey` bg-secondary/muted · `shadow` · `gold` gold text.

---

## Phase 0 — Foundations

Shared building blocks every later phase imports. Do this first so later phases just swap classes.

- [x] `src/components/site-next/site-styles.ts`: add `pillLink` (small "Read more" pill from
      `NewsEventsSection`'s `PillLink`), `circleIconButton` (carousel arrows), `eyebrow`
      (`text-[11px] font-bold uppercase tracking-[0.2em] text-crimson`), `editorialH2`
      (`font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-navy`).
- [x] Extract `PillLink` from `NewsEventsSection.tsx` into its own component (`PillLink.tsx`) and use it there.
- [x] `SectionHeading.tsx` (used in ~29 files): h2 → editorial style (`font-medium`, clamp size);
      eyebrow → `eyebrow` string; subtitle `text-muted-foreground` → `text-ink-soft`. Check the
      `variant="simple"` gold `accent-underline` still reads well (gold as decoration is allowed).
- [x] Form field styles: add `fieldInput` / `fieldLabel` strings — square, `border border-line bg-surface`,
      `focus:border-navy focus:ring-0`, label `text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft`.
- [x] `globals.css`: mark `card-lift` as deprecated in a comment (delete in Phase 9 once unused).
- [x] Update `BEIGE_DESIGN_SYSTEM.md` §6 with the new shared strings.
- [x] Our Institutes subtitle: dropped the hardcoded "Four" (six colleges listed).

_Done 2026-09-29. `SectionHeading` uses `sectionH2` (a step below `editorialH2`) so dense inner pages
don't get 53px headings. `fieldInput`/`fieldLabel` are defined but first used in Phase 5._

## Phase 1 — Hero system

Decisions (2026-09-29):
- **Inner banners** (`PageHero`, About hero): beige, **no photo**, homepage-hero typography, shorter than
  the homepage (≈60vh-ish desktop presence; content-height on phones), pill buttons.
- **College landing hero** keeps its per-college photo, restyled like the homepage hero: full-bleed photo,
  paper fade + blur on the left, dark text.
- **All admin appearance controls stay visible and working**, scoped as:

| Control | Applies to |
|---|---|
| Homepage Blur / Homepage Gradient | Left paper fade + blur on **both photo heroes** (homepage + college) |
| Photo Visibility (`heroImageOpacity`) | Photo opacity on both photo heroes |
| Overlay colour + intensity | Optional tint over the photo on both photo heroes; **unset colour → paper** (was navy) |
| Background Blur (`heroBlurPx`) | Whole-photo blur on **college heroes only** (as today) |
| Text colour (`heroTextColor`) | Hero heading/text on **every** hero incl. beige banners; **unset → navy `#2b2f5e`** (was white) |

Checklist:
- [x] `src/lib/theme.ts`: `heroOverlayStyles()` fallback colour navy → `var(--paper)`; `heroTextVars()`
      fallback `#ffffff` → `var(--navy)`. Add a helper for the homepage-style left fade + masked blur
      (move the inline gradient/blur code out of `HeroNew.tsx`) so HeroNew and the college hero share it.
- [x] `HeroNew.tsx`: use the shared fade helper; apply `heroImageOpacity` + overlay tint via
      `HeroPhotoLayer` / `heroOverlayStyles`; hero text uses `var(--hero-text)`. Verify the homepage
      looks unchanged with current saved values (opacity 100, overlay 5%).
- [x] `PageHero.tsx` (≈20 callers): remove `bg-navy`, radial gradient and blur orbs; `bg-paper` +
      `border-b border-line`; crumbs `text-ink-mute hover:text-crimson`; eyebrow crimson; h1 homepage
      scale in `var(--hero-text)`; subtitle `text-ink-soft`; top padding keeps header clearance
      (`--hero-offset`); drop photo rendering (keep the `backgroundImage` prop accepted but unused, or
      remove it with its one caller in `campus-life/layout.tsx`). `rightSlot` stays.
- [x] `PageHero` children: every caller that passes gold/white buttons (e.g. `admissions/page.tsx`
      "Start Application") → `pillPrimary` / `pillOutline`. Grep `<PageHero` and fix each.
- [x] `about/layout.tsx` hero: same treatment as `PageHero` (currently its own navy gradient + white chips);
      chips → `rounded-full border border-line-strong` ink text. Consider switching it to `PageHero`.
- [x] `CollegeLandingPage.tsx` hero (`CollegeHero`): homepage-style photo hero — `bg-cream` base,
      untinted-by-default photo with Photo Visibility + tint + Background Blur, left paper fade from the
      shared helper, kicker chip → crimson eyebrow, `(SVIT)` gold text → navy/crimson, pill buttons.
      Fallback when a college has no photo: plain beige banner like `PageHero`.
- [x] `HeroAppearancePanel.tsx` (admin): update the live preview to render the beige banner + photo-hero
      look so admins see real results; relabel help text to say where each control applies (table above).
      Keep every control visible. **Do not remove any control.**
- [x] Update `CONTEXT.md` glossary (Overlay hero vs Split hero vs beige banner) and
      `BEIGE_DESIGN_SYSTEM.md` with a "Heroes" section.
- [x] Set saved `app_settings.hero_appearance.heroTextColor` `#ffffff` → `#2b2f5e` — done early (2026-09-29):
      `origin/prod` never reads `heroTextColor`, so the live site is unaffected, and doing it now avoids
      white-on-beige banners during development. Revert: set it back to `#ffffff`.

_Done 2026-09-29. Notes: `--hero-text` is set once on the `(site)` layout wrapper (PageHero renders inside
client components, so it can't fetch settings). About banner now uses `PageHero` (+ breadcrumbs). The
admin panel preview shows a college photo hero + an inner page banner; nothing was hidden. The whole
college photo is blurred at the saved Background Blur (5px) — admins can lower it._

## Phase 2 — Section navigation

Tabs that sit under banners on About and Campus Life.

- [x] `about/AboutNav.tsx` (r2 navy1 grey1): pill tabs — active `bg-ink text-cream`, inactive
      `border border-line-strong text-ink hover:border-ink`; container no grey panel.
- [x] `CampusLifeNav.tsx` (r2 navy1 grey1): same pill vocabulary.
- [x] `PillTabs.tsx` (navy1): align active state with the above.
- [x] Mobile: tabs scroll horizontally in one row (no wrap into a tall block); active tab scrolled into view.

_Done 2026-09-29. The three sidebars (About, Campus Life, Department) now share `SectionSideNav.tsx`
(vertical list on lg, active = ink pill; one sideways-scrolling pill row below lg, active pill centred).
Their layout wrappers moved from `bg-secondary/30` to `bg-paper`. Department tab matching is now
case-insensitive (`/departments/ca` vs `CA`)._

## Mobile pass (after Phase 2)

- [x] `scripts/mobile-audit.mjs` added (overflow + tap-target check, widths 360/390/768).
- [x] Pill buttons, sidebar/tab pills `min-h-11`; `circleIconButton` 44px; carousel dots 44px hit area.
- [x] Breadcrumb links, footer phone/email ≥24px; footer socials, mobile header search/menu 44px.
- [x] HomePopup pills `min-h-11`, minimise button 44px.
- [x] HomePopup 43px was the entrance animation (scale 0.94→1): passes with `WAIT=3500`.
- [x] `/admissions` "Download fee structure →" link is 20px → fixed in Phase 7.

## Phase 3 — Shared cards and layouts

The components reused across campus life, news, departments, COE, student corner.

- [x] `EntryCard.tsx` (r2 lift1 navy2 gold1): square card, `border-line`, hover `bg-paper-deep`, no lift;
      image square-cornered with fixed aspect; date/meta `ink-mute`; always-visible "Read more".
      _Placeholder is now paper-deep + dots texture; interactive cards show "Read more" / "View"._
- [x] `DetailPageLayout.tsx` (r1 navy1): paper sections, hairline separators, editorial headings.
- [x] `PhotoSlider.tsx` (r1 navy1 grey3): square frame `border-line bg-paper-deep`; controls = circle icon
      buttons + navy/line-strong dots (match `Carousel.tsx`).
- [x] `EventsNewsSlider.tsx` (r3 navy1 grey3): same slider vocabulary; cards per EntryCard.
- [x] `EventsBrowser.tsx` (navy1 gold1): filters as pills; no gold text.
- [x] `DepartmentLayout.tsx` (r3 navy1 grey2 shadow1): sidebar/tabs to pill + hairline style, no shadow.
      _(done in Phase 2 via `SectionSideNav`; hero slot restyled in Phase 1)_
- [x] `DepartmentSections.tsx` (r11 lift2 navy2 grey4 shadow1 gold3): biggest shared file — joined grids
      for info blocks, square staff/lab cards, navy figures instead of gold, remove grey panels.
      _"View program →" / "View full profile →" now always visible (were hover-only / near-invisible).
      Staff grids use `grid-cols-[minmax(0,1fr)]` — truncated emails overflowed 360px phones by 46px._
- [x] `DeptActivitiesView.tsx` (r1 lift1 navy1): per EntryCard.
- [x] `DeptBranchCard.tsx` (r2 navy1 grey1 shadow1 gold1): name was hover-only (invisible on phones) →
      logo + always-visible name and "View department →"; phones put the logo beside the text.
      The joined grid around it belongs to `CollegeLandingPage` (Phase 6).
- [x] `CommitteeMembers.tsx` (navy1 gold2): table/list with hairlines; roles in crimson eyebrow, not gold.
- [x] `SportsSection.tsx` (r2 navy2 gold3): paper/paper-deep, square cards.
- [x] `GalleryAlbumView.tsx` (r2 navy1 gold1): square thumbnails, hairline grid. _Header now `PageHero`._
- [x] `HeroCardSlider.tsx` (r2 shadow2 gold2): unused → deleted.

_Done 2026-09-29._

## Phase 4 — Pop-ups and lightboxes

Keep the dark backdrop (right for photo viewing); the panels match the site.

- [x] `EntryViewer.tsx`: panel `rounded-2xl bg-white` → square `bg-paper border border-line`; close button
      = circle icon button.
- [x] `PhotoLightbox.tsx`: caption panel → square `bg-paper`; image `rounded-lg` → square; controls
      light-on-dark stay legible.
- [x] Verify focus trap / Esc / swipe unchanged; mobile full-height panel scrolls.

_Done 2026-09-30. Found and fixed while verifying: (1) neither dialog ever received focus — React's
`autoFocus` doesn't focus a `tabIndex` div — so Escape/arrow keys did nothing for keyboard users; new
`useDialogFocus` hook focuses the dialog and returns focus to the opener on close. (2) Dialogs were `z-50`,
under the fixed mobile header (`z-[60]`), which covered the lightbox close button on phones; now `z-[70]`
like HomePopup. Backdrops use `ink`; round controls are 44px light-on-dark outlines._

## Phase 5 — Forms

- [x] `EnquiryForm.tsx` (r1 navy1 grey1): fields → `fieldInput`/`fieldLabel`; submit → `pillPrimary`
      (full-width on phones); panel square on paper-deep or hairline-framed.
- [x] `InquiryForm.tsx` (r3 navy1 gold3): same; no gold text.
- [x] `GrievanceForm.tsx` (r1 navy1 gold1): same.
- [x] `StudentLoginForm.tsx` (r1 navy2 gold1): same.
- [x] Error/success states: errors are toasts (sonner) + native `required` validation, no inline error boxes;
      success panels restyled (medium heading, `ink-soft` text, gold check icon as decoration).
- [ ] Submit each form once against the dev server to confirm behaviour unchanged. _Not done: real
      submissions write to the live DB and the user hasn't approved test rows. Submit handlers weren't
      touched (class changes only); empty submits verified blocked by `required` with writes intercepted._

_Done 2026-09-30. `fieldInput` is 44px tall with 16px text below md (iOS zooms inputs under 16px) and
14px from md. Placeholder-only fields got `aria-label`s; login fields got `autoComplete`. The per-form
`<style>.input{…}</style>` blocks are gone. `EnquiryForm` is currently unused (no page renders it)._

## Phase 6 — Big page templates

- [x] `PlacementPage.tsx` (r17 lift2 navy13 grey6 shadow1 gold7): the heaviest file — stat strips per
      homepage numbers strip, recruiter/company grids as joined grids, navy bands → paper/paper-deep,
      charts/tables hairline-styled, one gold-soft CTA max. Consider splitting into sub-components while here.
- [x] `CollegeLandingPage.tsx` body (r3 lift2 navy3 grey1 gold5); also dedupe trust badges by title
      ("AICTE Approved" appears twice → React duplicate-key error), as the homepage `TrustBand` does: sections per design system; program/
      department cards via `DeptBranchCard`; stats per numbers strip; closing CTA uses `CTABanner`.
      Fix the `DeptBranchCard` fallback label: "B.Sc. (IT)" renders as "B(" (initials taken from raw words).

_Done 2026-09-30. PlacementPage: metric strip = homepage numbers strip; highlights as a hairline list;
navy chart bars (year labels in their own row); recruiter wall as a joined grid; square student cards;
show-more/less and officer contacts as pills; empty trend data shows a note instead of an "N/A / 0" chart.
CollegeLandingPage: stats strip, joined-grid programmes (`DeptBranchCard variant="cell"`), Why band and
trust band match the homepage; trust badges deduped (duplicate-key error gone); initials skip punctuation
("B.Sc. (IT)" → "BI"); the static, always-empty "Events & News" section no longer renders a blank heading._

## Phase 7 — Page by page

For each page: before/after screenshots, apply the cheat sheet (design doc §9) to anything page-local,
confirm mobile rules (§8), tick it off. Dynamic routes: check at least two real instances.

Detail ("leaf") pages share a page-local pattern to fix consistently: a "← All events"-style back link
(20px tall — make it ≥24px, e.g. a `PillLink`-style pill or padded link) and a rounded-2xl facts panel
(`grid … rounded-2xl border-2 border-navy/15 bg-white p-6`) → joined hairline grid on paper-deep.
Seen on `campus-life/events/[slug]`; check facilities, clubs, labs, student-corner, news, achievements.

**About** (shared: about/layout, AboutNav)
- [x] `/about`
- [x] `/about/accreditation` (r6 navy2 grey2 gold3)
- [x] `/about/history-vision-mission` (r4 navy1 grey1 gold3)
- [x] `/about/board-of-management`
- [x] `/about/chairman-message`
- [x] `/about/principal-message`
- [x] `/about/committees`
- [x] `/about/media` (r2 gold2)

**Admissions**
- [x] `/admissions` (r4 lift1 navy1 grey2 gold2)
- [x] `/admissions/intake-fees` (navy1 grey2) — tables with hairlines
- [x] `/admissions/scholarships` (lift1 navy2 grey1 gold1)
- [x] `/admissions/inquiry`

**Colleges & academics**
- [x] `/colleges` (lift1 grey1 gold1)
- [x] `/colleges/[college]` — check all 6 colleges
- [x] `/courses` (lift1 gold1)
- [x] `/courses/[course]` (r2 gold5)
- [x] `/programs/[program]` (gold1)
- [x] `/coe` (lift1 navy1)

_Open question for the user: `/courses/[course]` "Where our graduates go" renders 200+ recruiter names
as a text wall (~11,000px tall on phones). Options: homepage-style `RecruitersMarquee`, or a collapsed
list with "Show all". Course tiles now use the programme's admin `theme_color` as an accent bar only
(white text on `bg-gold` was unreadable)._

**Departments** (check ≥2 departments each)
- [x] `/departments/[dept]`
- [x] `/departments/[dept]/staff`
- [x] `/departments/[dept]/labs`
- [x] `/departments/[dept]/labs/[slug]` (lift1 navy1)
- [x] `/departments/[dept]/achievements`
- [x] `/departments/[dept]/activities`

**People**
- [x] `/staff/[staff]` (r2 navy1 shadow2 gold1) — faculty profile; see `docs/design/faculty-profile-mockup.html`

**Campus life** (shared: campus-life/layout, CampusLifeNav)
- [x] `/campus-life` (r4 lift4 navy1)
- [x] `/campus-life/facilities`
- [x] `/campus-life/facilities/[...slug]` (lift1 navy1)
- [x] `/campus-life/events`
- [x] `/campus-life/events/[slug]`
- [x] `/campus-life/clubs/[slug]`
- [x] `/campus-life/clubs/[slug]/events`
- [x] `/campus-life/student-groups` (r2 lift2)
- [x] `/campus-life/nss-ncc` (lift1 navy1)
- [x] `/campus-life/sports-and-athletics`

_Campus life: club pages re-checked later — pass at 360/390/768._

**News, gallery, achievements**
- [x] `/news`
- [x] `/news/[slug]`
- [x] `/gallery` (gold2)
- [x] `/gallery/[albumId]`
- [x] `/achievements/[slug]`

**Placement**
- [x] `/placement`

**Other**
- [x] `/careers` (r2 lift1 navy1 grey1 gold1)
- [x] `/downloads` (lift1 navy1)
- [x] `/parents` (r2 lift1 navy2 grey1)
- [x] `/grievance` (grey1)
- [x] `/anti-ragging` (r2 navy1 gold2)
- [x] `/student-login`
- [x] `/student-corner/[slug]` (lift1 navy1)

_Phase 7 done 2026-09-30: every page above passes the mobile audit at 360/390/768 (Campus life
club pages re-checked after the earlier server interruption)._

Not in scope (redirect only): `/placement/[college]`, `/courses/[course]/faculty`,
`/courses/engineering/[dept]`, `/courses/engineering/[dept]/faculty`.

## Phase 8 — Leftovers

- [x] Not-found pages: `campus-life/clubs/not-found.tsx`, `campus-life/events/[slug]/not-found.tsx`,
      `campus-life/facilities/[...slug]/not-found.tsx`, `student-corner/[slug]/not-found.tsx`, plus any
      other `not-found.tsx` under `src/app/(site)` — pill buttons, editorial heading, no rounded panels.
- [x] Header mega panels (`nav/CollegesMegaPanel.tsx`, `nav/CampusMegaPanel.tsx`): `rounded-md bg-white`
      logo chips → square `border-line bg-surface`; `bg-secondary` hovers → `bg-paper-deep`.
- [x] `nav/DesktopNavItem.tsx` shadow on dropdown → hairline border (keep a subtle shadow only if the
      panel needs separation from the photo hero).
- [x] `SmoothScrollToggle.tsx` gold text → navy.
- [ ] Remaining prettier drift in files we touched (`page.tsx`, `CTABanner.tsx`) — format in a separate commit.

_Done 2026-09-30. All 14 `not-found.tsx` pages now render the shared `NotFoundPanel` (crimson
eyebrow, section link + "Back to home" pills; `embedded` inside the Campus Life column). Mega-panel items
are square with paper-deep active/hover; the dropdown has hairlines and a soft shadow (it opens over the
photo hero); SiteSearch muted text → ink-soft; smooth-scroll toggle active = crimson._

## Phase 9 — QA and release

- [ ] Pre-existing, not design: 404 pages log "Encountered a script tag while rendering React component"
      (an inline script rendered by a component, likely the font-scale init in `src/app/layout.tsx`). Investigate.
- [ ] Re-run the audit; remaining hits must be justified (pills, popup, gold icons, tile hover):
      ```sh
      grep -rlE "rounded-(xl|2xl|3xl)|card-lift|bg-navy|bg-secondary|shadow-(md|lg|xl|2xl)|text-gold" \
        "src/app/(site)" src/components/site-next
      ```
- [ ] Delete `card-lift` from `globals.css` once unused.
- [ ] Admin regression pass: Homepage editor, Hero Appearance panel (every control changes something
      visible per the Phase 1 table), media uploads, menus, CRUD pages that preview public components.
- [x] Set `hero_appearance.heroTextColor` → `#2b2f5e` — done in Phase 1 (old value `#ffffff`).
- [ ] Full-page screenshots of every Phase 7 page at 390 / 1440 for sign-off.
- [ ] `npm run build` passes (needs public Supabase env vars; build crawls a running server for the search index).
- [ ] Update `BEIGE_DESIGN_SYSTEM.md` (heroes, forms, tabs sections) and prune the §10 rollout list.
- [ ] Commit per phase (no force-push / rebase of pushed history — Lovable sync).
