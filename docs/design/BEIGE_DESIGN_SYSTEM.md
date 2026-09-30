# SVIT Beige Design System

Reference for bringing every public page onto the beige editorial theme. Written 2026-09-29 after the
homepage overhaul; the homepage (`src/app/(site)/page.tsx`) is the canonical implementation — when this
doc and the homepage disagree, the homepage wins and this doc should be updated.

Scope: the public site (`src/app/(site)/**`, `src/components/site-next/**`). The admin panel has its own
theme and is out of scope.

The phased site-wide rollout plan with progress checklists is in [`todo.md`](./todo.md).

---

## 1. Principles

The look comes from two reference pieces: the homepage hero (`HeroNew`) and the campus-life mosaic
("Life beyond the classroom"). Everything else is derived from them.

1. **Paper, not panels.** Pages read as one continuous sheet of warm paper. Sections are separated by
   hairlines and a slightly deeper beige, never by dark full-width bands.
2. **Hairlines over shadows.** Structure comes from 1px lines (`border-line`). No drop shadows, no
   lift-on-hover, no glow orbs, no glassmorphism.
3. **Square by default, round only for pills.** Cards, tiles, images and grids have square corners.
   Rounding is reserved for things that are fully round: pill buttons, pill chips, dots, circular
   icon buttons.
4. **Navy is ink, not paint.** Navy is for headings, icons, borders and hover states — not for section
   backgrounds. (The one sanctioned navy fill is the campus-life tile hover.)
5. **Gold is decoration, never text on light.** Gold for check-marks, rules, dots. Text is navy / ink,
   with crimson for small highlights.
6. **Editorial type.** Large Playfair headings at medium weight, small tracked uppercase eyebrows,
   generous whitespace.
7. **Works without hover.** Every affordance visible at rest; hover only enhances. Designed for 390px
   first-class, not as an afterthought.

---

## 2. Colour

Tokens live in `src/app/globals.css` (`:root`, exposed to Tailwind via `@theme inline`).

| Token (Tailwind) | Value | Role |
|---|---|---|
| `paper` / `cream` | `#fbf8f1` | Page background, default section background. `cream` is an alias — prefer `paper` for surfaces, `cream` for text on ink buttons (matches hero). |
| `paper-deep` | `#f3ecdf` | Emphasis band (e.g. "Why SVIT"), footer, hover fill on cards, image placeholders. |
| `surface` | `#ffffff` | Cards/tiles that need to lift off paper (college cards, campus tiles, logo boxes). Use sparingly. |
| `gold-soft` | `#f5e4bf` | The single warm call-to-action band per page ("Take the next step"). |
| `ink` | `#1d1f2b` | Body text, primary pill button fill. |
| `ink-soft` | `#5a5e70` | Secondary text: subtitles, descriptions, footer body. |
| `ink-mute` | `#8d909c` | Tertiary: stat labels, dates, captions, inactive UI. |
| `navy` | `#2b2f5e` | Headings, icons, stat figures, hover borders, active dot. |
| `crimson` | `#c2402f` | Eyebrows, small highlights, primary button hover, link hover, trailing "." accents. |
| `gold` | `#e9b84f` | Decorative only: check icons, underline accents, arrows on navy. |
| `line` | ink @ 14% | Default hairline. |
| `line-strong` | ink @ 34% | Outline buttons, circular icon buttons, inactive dots. |
| `navy-deep` `#181b3a`, `navy-light` | — | **Legacy.** Don't introduce new uses on public pages. |
| `secondary` / `muted` `#f7f5f2` | — | **Legacy grey-beige** from shadcn. Replace with `paper` / `paper-deep`. |

### Contrast rules

- **Never gold text on paper / white / gold-soft** — `#e9b84f` on `#fbf8f1` is ≈1.8:1. Gold text is only
  acceptable on navy (e.g. campus tile hover eyebrow).
- Body copy: `ink` or `ink-soft`. `ink-mute` only for short labels (≥ uppercase / small caps style),
  not paragraphs.
- Crimson on paper is fine for eyebrows and short highlights, not paragraphs.

### Section background sequence

Alternate to create rhythm without dark bands:

```
paper → paper (hairline between) → surface/white → paper-deep → paper → gold-soft (CTA) → paper-deep (footer)
```

Rules: never stack two `paper-deep` sections; `gold-soft` at most once per page, directly before the
footer; when two sections share a background, separate them with `border-t border-line` / `border-y`.

---

## 3. Typography

Fonts (loaded in `src/app/layout.tsx`): **Playfair Display** (`font-display`, all h1–h4 by default) and
**Inter** (`font-sans`, body).

| Element | Classes |
|---|---|
| Hero h1 | `text-[clamp(1.9rem,3.6vw,3.3rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink` + optional italic accent `<em className="font-serif font-medium italic">` |
| Section h2 (editorial) | `font-display text-[clamp(2rem,4.2vw,3.3rem)] font-medium leading-[1.12] tracking-[-0.01em] text-navy` |
| Section h2 with italic accent | e.g. "News & *Events*": bold base + `font-display italic font-medium` span (`SplitHeading`) |
| Card / tile title (h3) | `font-display text-lg`–`text-xl font-medium leading-tight text-navy` |
| Eyebrow | `text-[11px] font-bold uppercase tracking-[0.2em] text-crimson` (hero uses `text-[0.7rem] tracking-[0.22em]`) |
| Tile eyebrow (quiet) | `text-[9.5px] font-bold uppercase tracking-[0.2em] text-muted-foreground` |
| Body / subtitle | `text-base md:text-lg leading-relaxed text-ink-soft` |
| Card description | `text-sm leading-relaxed text-ink-soft` |
| Stat figure | `font-display text-3xl md:text-4xl font-medium text-navy` |
| Stat / meta label | `text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-mute` |
| Dates, captions | `text-xs font-semibold uppercase tracking-wider text-ink-mute` |

Notes:
- Prefer **`font-medium`** for display headings in content sections; `font-bold`/`extrabold` reads as
  the old theme. Hero h1 and `SplitHeading` bold bases are the exceptions.
- A crimson full stop after a section title (`Life beyond the classroom<span className="text-crimson">.</span>`)
  is an optional signature accent — use at most once or twice per page.
- `SectionHeading` renders `sectionH2` (`clamp(1.85rem,3.2vw,2.6rem)`, medium) — a step below
  `editorialH2` so dense inner pages don't get 53px headings.

---

## 4. Surfaces, borders, corners, shadows

- **Borders:** `border border-line` for everything structural. `border-line-strong` only for outline
  pills and circular icon buttons. Hover border: `hover:border-navy`.
- **Corners:** square. Remove `rounded-md/lg/xl/2xl/3xl` from cards, panels, images, logo boxes, grids.
  Keep `rounded-full` for pills, chips, dots, round icon buttons.
- **Shadows:** none. Remove `shadow-*`, `card-lift`, `backdrop-blur`, blurred colour orbs and radial
  gradient overlays. Exception: modal/popup overlays (`HomePopup`) may keep a soft shadow for layering.
- **Images:** square-cornered, optionally `border border-line`, placeholder background `bg-paper-deep`.
  Fixed aspect ratio (`aspect-[4/3]`, `aspect-video`) so layout doesn't jump.
- **Photos are never tinted dark to carry text.** Use a split layout (photo and text in separate
  regions) — see `CONTEXT.md` "Split hero". The homepage hero's paper-coloured left fade is the only
  overlay pattern, and it is paper, not navy.
- **Texture:** the campus mosaic's navy line patterns (`TILE_PATTERNS` in `page.tsx`: lines, dots,
  grid, arc, diag at 10–22% navy) are available for empty tiles/placeholders that need interest
  without a photo.

---

## 5. Spacing and layout

- **Container:** `container-page` (max 80rem, 20px gutters, 32px from md).
- **Section rhythm:** `sectionSpacing` = `py-[clamp(84px,11vw,144px)]` for major sections (from
  `src/components/site-next/site-styles.ts`). Thin bands (stats, trust badges) use `py-10 md:py-14`.
  Avoid fixed `py-20` — it doesn't scale down on phones.
- **Heading → content gap:** `mt-12` after `SectionHeading`, or `mb-[clamp(40px,5vw,64px)]` on an
  editorial h2.
- **Grids:** gaps of `14px` (mosaic) to `gap-5` (cards). Joined grids have no gap (lines instead).

### Grid patterns

**Joined hairline grid** (Why SVIT, Our Institutes) — cells share lines; ragged last row stays clean:

```tsx
<div className="grid border-t border-l border-line md:grid-cols-2 lg:grid-cols-3">
  {items.map((it) => (
    <div key={it.id} className="border-r border-b border-line p-6 md:p-8">…</div>
  ))}
</div>
```

**Gap-px grid** (stats) — only for grids that always fill rows; add `last:odd:col-span-2` for 2-col:

```tsx
<div className="grid grid-cols-2 gap-px bg-line lg:flex lg:gap-0 lg:divide-x lg:divide-line lg:bg-transparent">
  {stats.map((s) => <div className="bg-paper px-3 py-6 text-center last:odd:col-span-2 lg:flex-1">…</div>)}
</div>
```
(Cells must use the section's background colour, or the `bg-line` shows through.)

**Editorial two-column** (News & Events) — `md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]`, rows
separated by `border-b border-line`, heading block underlined by an animated hairline.

---

## 6. Component recipes

Shared class strings: `src/components/site-next/site-styles.ts`. Import these rather than re-typing.

| Export | Use |
|---|---|
| `pillPrimary` / `pillOutline` | Buttons (below) |
| `pillLink` | Small inline pill; render via the `PillLink` component |
| `circleIconButton` | Round outline icon buttons (arrows, close, socials) |
| `sectionSpacing` | Vertical padding for major sections |
| `eyebrow` | Crimson uppercase kicker above headings |
| `editorialH2` | Large editorial section title (mosaic, carousel, CTA band) |
| `sectionH2` | Standard section title — what `SectionHeading` renders |
| `fieldInput` / `fieldLabel` | Square hairline form fields and their labels |

### Buttons

| Kind | Recipe |
|---|---|
| Primary | `pillPrimary` — ink fill, cream text, → crimson on hover |
| Secondary | `pillOutline` — `line-strong` outline, ink text, → ink fill on hover |
| Small link-pill ("Read more", "All news") | `<PillLink href>` (`PillLink.tsx`, class `pillLink`) |
| Circular icon button (arrows, socials) | `circleIconButton` |
| Trailing arrow | `ArrowRight h-4 w-4 transition-transform group-hover:translate-x-0.5` |

Gold buttons (`bg-gold text-navy`), `rounded-md/xl` buttons and white-on-glass buttons are retired.
Button groups: `flex flex-col gap-3 sm:flex-row` so they stack full-width on phones.

### Eyebrow chip (for CTA bands)
`rounded-full border border-navy/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson`

### Link cell in a joined grid (college cards)
Same joined grid as "Why SVIT" (§5), but each cell is a link. Section stays on `paper`; cells have no fill.
```
<Reveal className="border-r border-b border-line">
  <Link className="group flex h-full gap-4 p-5 transition-colors duration-300
    ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-paper-deep active:bg-paper-deep
    md:flex-col md:gap-5 md:p-8">
```
- Hover/tap fills the whole cell with `paper-deep` — never change a cell's border colour (lines are
  shared with neighbours).
- Left-aligned content: logo → crimson code eyebrow → display name → italic `ink-soft` tagline →
  "Explore →" pinned with `mt-auto`, always visible, `group-hover:text-crimson`.
- Logo frame: `h-14 w-14 md:h-16 md:w-16 border border-line bg-surface p-1.5` (uploaded logos often
  carry a white background; the frame makes that intentional).
- Phones: logo sits beside the text (`flex-row`); `md+` stacks it on top (`md:flex-col`).
- Column count from item count (`collegeGridCols()` in `page.tsx`); partial last rows left-align.

### Mosaic tile (campus life)
White tile with a navy line pattern that **fills navy on hover** (pattern fades, eyebrow → gold, title
→ cream, arrow slides in). Use only for text-only tiles — never where uploaded images/logos would end
up on navy. See `CampusLifeSection` in `page.tsx`.

### Feature cell (Why SVIT)
Inside a joined grid: plain icon `h-6 w-6 text-navy strokeWidth={1.5}` (no tinted square), `mt-5`
display title, `text-sm text-ink-soft` description. No hover when not a link.

### Stat strip
Paper band, gap-px grid (see §5), navy display figures, uppercase `ink-mute` labels. Figures
`lg:text-3xl 2xl:text-4xl` when many sit in one row.

### Badge row (trust band)
`grid grid-cols-2 md:grid-cols-4 border-y border-line py-7` with `BadgeCheck text-gold` + navy uppercase
label. No box.

### Split photo/text block (carousel, feature rows)
Two columns on `md+` (text left, photo right via `md:order-first` on the text), photo first on phones.
Photo `aspect-[4/3] border border-line bg-paper-deep`, untinted. Rotating content stacks all slides in
one grid cell (`[grid-area:1/1]`, inactive `invisible opacity-0`) so height never jumps. Controls
under the text: circular arrows (md+) + dots (`bg-navy` active `w-8`, `bg-line-strong` inactive).
See `src/components/site-next/Carousel.tsx`.

### CTA band
`CTABanner`: `border-t border-line bg-gold-soft` + `sectionSpacing`, centred eyebrow chip, editorial
navy h2, `ink-soft` subtitle, `pillPrimary` + `pillOutline`. One per page, just above the footer.

### Footer
`border-t border-line bg-paper-deep text-ink-soft`; non-light `Logo`; navy icons; headings
`text-navy`; links `hover:text-crimson`; circular social buttons; `border-line` dividers.

### Heroes
Two kinds (glossary: `CONTEXT.md`):

- **Photo hero** — homepage (`HeroNew`) and college pages (`CollegeLandingPage` `Hero`). Full-bleed photo
  on `bg-cream`, `heroOverlayStyles()` tint, `heroFadeStyles()` paper fade + masked blur on the left,
  text left in `max-w-[34rem]`–`36ch`. Phones: an extra `bg-cream/75` wash (college) since text spans the width.
- **Page banner** — `PageHero` on every inner page. `bg-paper border-b border-line`, faint navy grid
  texture on the right (lg+), breadcrumbs top (uppercase `ink-mute`, hover crimson), then crimson eyebrow,
  h1 `clamp(2.2rem,4.6vw,3.8rem)` bold, subtitle, and `children` as a pill-button row.
  `lg:min-h-[60vh]`, content-height on phones. Put actions in `children` using `pillPrimary`/`pillOutline`;
  chips (About) as `rounded-full border border-line-strong` uppercase `ink-soft`.

Admin controls (`app_settings.hero_appearance`, edited in Admin → Homepage → Hero Appearance):

| Control | Applies to |
|---|---|
| Homepage Blur / Homepage Gradient Opacity | The left fade + blur on both photo heroes |
| Photo Visibility / Overlay colour + intensity | Both photo heroes (unset colour → paper) |
| Background Blur | College photo heroes only |
| Text Color | Every hero via `--hero-text` (set on the public layout wrapper); unset → navy |

Hero text uses `text-[var(--hero-text)]` (or `var(--hero-text,var(--navy))`), never a hardcoded colour.

### Section navigation
- **`SectionSideNav`** — sidebar beside inner-page content (About, Campus Life, Department). Crimson
  eyebrow title; lg+: vertical list, active item `border-ink bg-ink text-cream` pill, others `ink-soft`
  with `hover:bg-paper-deep`; below lg: one sideways-scrolling row of outline pills (hidden scrollbar,
  bleeds to the screen edge), active pill centred on load.
- **`PillTabs`** — horizontal sub-section tabs above content; same pills, wraps on lg, scrolls below lg.

### Forms
Fields use `fieldInput` (square hairline box, `min-h-11`, navy focus ring, **16px text below md** so iOS
Safari doesn't zoom on focus) and labels `fieldLabel` (small uppercase `ink-soft`). Fields without a
visible label need an `aria-label`. Submit = `pillPrimary` full-width; checkboxes `accent-navy` inside a
padded `<label>`. Form panels: `border border-line bg-surface p-6 md:p-8`; side panels `bg-paper-deep`.

### Header
Already on theme: floating cream bar, `text-ink-soft hover:text-crimson`. Mega panels use `bg-white`
logo chips with `rounded-md` — minor cleanup candidate.

---

## 7. Interaction and motion

- **Easing:** `cubic-bezier(0.22,1,0.36,1)` (ease-out-expo feel) for most transitions, 300–500ms.
- **Hover vocabulary:** border → navy; background → `paper-deep`; text → crimson; arrow nudges
  `translate-x-0.5`. Not: lifting, scaling up, shadows.
- **Press:** `active:scale-[0.98]` on pills; `active:` mirror of hover on cards so touch gets feedback.
- **Reveals:** wrap blocks in `Reveal` with small staggered delays (`i * 0.03–0.05`).
- **Hairline draw-in:** `motion.span` with `scaleX 0→1` (News & Events heading) for section rules.
- **Carousels:** auto-advance ~5.5s, pause on hover, swipe on touch (40px threshold), crossfade images.
- `prefers-reduced-motion` is globally honoured in `globals.css`; don't bypass it.

---

## 8. Mobile rules (390px is a first-class target)

1. **No hover-only affordances.** Arrows, "Explore", "Read more" visible at rest.
2. **Buttons stack full-width** below `sm` (`flex-col` + `max-w-sm` container, or `w-full sm:w-auto`).
3. **Split layouts stack photo-first**, fixed aspect ratio.
4. **Grids:** 1 col for text cells (joined grid), 2 cols for stats/badges; odd last stat spans 2
   (`last:odd:col-span-2`).
5. **Spacing uses `clamp()`** so sections tighten on phones.
6. **Carousels:** hide arrow buttons below `md`, keep dots + swipe.
7. Hit targets ≥ 40px for icon buttons; accordion footers stay as they are (`FooterCol`).
8. Check at **390, 768, 1024, 1440**. 1024 is where single-row strips crowd first.

---

## 9. Migration cheat sheet

| Old pattern | Replace with |
|---|---|
| `rounded-2xl` / `rounded-xl` / `rounded-lg` on cards, panels, images | remove (square) |
| `card-lift` | `transition-colors hover:border-navy hover:bg-paper-deep` (links) or nothing |
| `shadow-md/lg/xl`, `backdrop-blur`, blur orbs, radial gradient overlays | remove |
| `bg-navy` / `bg-navy-deep` section or panel | `bg-paper`, `bg-paper-deep`, or `bg-gold-soft` (CTA only) |
| `bg-secondary`, `bg-secondary/50`, `bg-muted` | `bg-paper-deep` (band) or `bg-paper` |
| `bg-white` section | `bg-paper` (keep `bg-surface` only for cards on paper) |
| `border-border` | `border-line` (same value; prefer the palette name in new code) |
| `text-gold` on light backgrounds | `text-navy` (figures/labels) or `text-crimson` (eyebrows) |
| `text-muted-foreground` for paragraphs | `text-ink-soft` |
| `text-white`, `text-white/70` (after moving off navy) | `text-navy` / `text-ink` / `text-ink-soft` |
| `hover:text-gold` | `hover:text-crimson` |
| `bg-gold text-navy` buttons, `rounded-md/xl` buttons | `pillPrimary` / `pillOutline` |
| Icon in tinted square `rounded-md bg-navy/5` | bare icon `text-navy strokeWidth={1.5}` |
| `font-bold`/`font-extrabold` section h2 | `font-medium` editorial h2 |
| Fixed `py-20` sections | `sectionSpacing` |
| Photo with navy gradient + white text | split layout, untinted photo |
| `<Logo light />` | `<Logo />` |

### Anti-patterns
- Two dark bands, or any dark band, between header and footer.
- Gold text on light backgrounds.
- More than one `gold-soft` band per page.
- Hover-only content (text that only appears on hover).
- Mixing button styles within a page.
- Hardcoding colours as hex in components (`#fbf8f1` inline) — use tokens. (Existing `rgba(43,47,94,…)`
  in `TILE_PATTERNS` is the documented exception.)

---

## 10. Rollout plan

### Highest-leverage shared components (do first — each fixes many pages)

| Component | Used by | Issue |
|---|---|---|
| `PageHero.tsx` | ~21 inner pages | Navy Overlay hero with blur orbs, gold eyebrow. **Open decision:** convert to a paper hero (text-only on paper, optional split photo) — this interacts with the admin-editable `HeroAppearance` overlay settings (`heroOverlayColor`, etc.), which would become unused for Overlay heroes or need a paper default. Decide before editing. |
| `SectionHeading.tsx` | ~29 files | `font-bold` h2 → editorial `font-medium` clamp size. |
| `DetailPageLayout.tsx`, `DepartmentLayout.tsx`, `DepartmentSections.tsx` | departments, labs, detail pages | Rounded panels, `bg-secondary`, navy fills. |
| `CollegeLandingPage.tsx` | every `/colleges/[college]` | Rounded cards, card-lift, navy sections, gold text. |
| `PlacementPage.tsx` | `/placement`, college placement | Heaviest: 17 rounded, 13 navy, 7 gold. |
| `EntryCard.tsx`, `EntryViewer.tsx`, `EventsNewsSlider.tsx`, `PhotoSlider.tsx`, `GalleryAlbumView.tsx` | campus life, gallery, events | Rounded cards, card-lift, `bg-secondary`. |
| `PillTabs.tsx`, `CampusLifeNav.tsx`, `about/AboutNav.tsx` | section navs | Navy active state / rounded containers — check against pill vocabulary. |
| Forms: `EnquiryForm`, `InquiryForm`, `GrievanceForm`, `StudentLoginForm` | admissions, grievance | Rounded panels, navy buttons, gold text. Inputs: square, `border-line`, `bg-surface`, focus `border-navy`. |

### Page files with direct old-style usage (audit 2026-09-29)

about/{accreditation, history-vision-mission, media, board-of-management, chairman-message,
principal-message, committees, layout}, admissions/{page, intake-fees, scholarships}, anti-ragging,
campus-life/{page, nss-ncc, student-groups, facilities/[...slug], events/[slug], layout}, careers, coe,
colleges, courses/{page, [course]}, departments/[dept]/labs/[slug], downloads, gallery, grievance,
parents, programs/[program], staff/[staff], student-corner/[slug], and the `not-found.tsx` pages.

Re-run the audit any time:

```sh
grep -rlE "rounded-(xl|2xl|3xl)|card-lift|bg-navy|bg-secondary|shadow-(md|lg|xl|2xl)|text-gold" \
  "src/app/(site)" src/components/site-next
```
(Expect some legitimate hits: `hover:bg-navy` on pills/tiles, `text-gold` on navy tile hover and on
check icons, `rounded-*` on pills/popup.)

### Per-page checklist

1. Screenshot before at 390 / 1024 / 1440 (Playwright with system Chrome:
   `chromium.launch({ executablePath: "/usr/bin/google-chrome" })`).
2. Map section backgrounds to the §2 sequence; remove dark bands.
3. Apply §9 replacements; import `pillPrimary`/`pillOutline`/`sectionSpacing`.
4. Check every text colour against §2 contrast rules (no gold text on light).
5. Check mobile rules §8 — nothing hover-only, buttons stack, odd grids handled.
6. Don't hardcode content the admin edits (CLAUDE.md) — style only.
7. Screenshot after at the same widths; compare against the homepage for consistency.
8. `npx tsc --noEmit` and `npx eslint <changed files>`.
