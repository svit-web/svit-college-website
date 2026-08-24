# Zoom Toggle — Implementation Plan

Status: **Planned, not yet implemented**
Scope: Public site only (admin panel excluded)

## Goal

Let visitors scale the whole page — text and layout together, not just font size in isolation — up or down, with the choice persisted across visits.

## Approach: root `font-size` (rem) scaling

The site runs Tailwind v4 with its stock rem-based scale — no `tailwind.config.js`, no px overrides in the `@theme` block (`src/styles.css`), and no existing `html { font-size }` rule to fight. That means `text-sm`, `p-4`, `gap-6`, `w-64`, etc. are all defined in `rem`, so changing the root font-size scales fonts *and* spacing *and* most sizing together — real "dynamic display scaling," not just bigger text in a cramped layout.

This beats the alternatives:
- **CSS `zoom` property** — real display scaling but historically inconsistent across browsers (Firefox only gained support in 2024) and harder to control per-element.
- **`transform: scale()`** — doesn't reflow layout, causes overflow/clipping and breaks click coordinates on fixed elements; wrong tool for a whole-page zoom.

Root rem-scaling is the standard technique behind most "A− / A+" accessibility toggles for exactly this reason.

## Locked-in decisions

| Decision | Choice |
|---|---|
| Control type | Stepper: **A− / Reset / A+** buttons |
| Zoom levels | `90% → 100% (default) → 110% → 125% → 150%` |
| Scope | Public site only — admin panel (`/admin/*`) excluded |
| Placement | In `Header.tsx`, alongside existing nav/utility controls |

## Implementation steps

1. **`src/contexts/ZoomContext.tsx`** — new context following the existing `AdminAuthContext.tsx` shape (`createContext` / `ZoomProvider` / `useZoom()` hook with a not-found guard). Holds the current level, `zoomIn()`, `zoomOut()`, `reset()`, clamped to the preset array. On change, writes the level to `localStorage` and sets `data-zoom="110"` (etc.) on `document.documentElement`.

2. **FOUC / hydration guard** — this is SSR (TanStack Start; the HTML shell is `RootShell` in `src/routes/__root.tsx`, there is no static `index.html`). A blocking inline `<script>` must run in `<head>`, before `<HeadContent />`/hydration, reading `localStorage` synchronously and setting `data-zoom` on `<html>` immediately — the same pattern dark-mode toggles use to avoid a flash of the wrong scale. `ZoomProvider`'s initial React state must read from that already-applied attribute rather than defaulting to 100, to avoid a hydration mismatch warning.

3. **CSS in `src/styles.css`**:
   ```css
   html[data-zoom="90"]  { font-size: 90%; }
   html[data-zoom="100"] { font-size: 100%; }
   html[data-zoom="110"] { font-size: 110%; }
   html[data-zoom="125"] { font-size: 125%; }
   html[data-zoom="150"] { font-size: 150%; }
   ```
   Wrapped in `@media (prefers-reduced-motion: no-preference)` for a `transition: font-size 0.15s ease` — instant otherwise.

4. **`ZoomToggle` component** — the A− / Reset / A+ buttons, `aria-label`s ("Decrease text size" etc.), `aria-pressed`/live region so the current level is announced, dropped into `Header.tsx` next to the existing nav.

5. **Wire-up** — `ZoomProvider` wraps the public branch only in `RootComponent` (`__root.tsx`), so `/admin/*` is untouched.

## Known gaps (flag, don't silently fix here)

Root-rem scaling can't touch anything pinned to a literal `px` value. On the public site, research turned up:

- `src/components/site/Header.tsx` mega-menu panels: `w-[720px]` (~line 279), plus `w-[380px]`/`w-[260px]` submenus (~lines 607, 652) — width stays fixed while inner content reflows, which will look off at 150%.
- `src/components/site/Carousel.tsx:37` — `h-[520px] md:h-[620px]` hero height won't grow with zoom, so content may feel cramped vertically at high zoom.

Recommendation: ship the toggle first, then convert just these few offenders to `rem` (e.g. `w-[45rem]` instead of `w-[720px]`) as a fast follow, now that we know exactly where they are.

## Side effect worth calling out (not a bug)

Tailwind v4's responsive breakpoints (`md:`, `lg:`) are also `rem`-based, so zooming will shift *when* the layout switches to mobile/tablet stacking — e.g. at 150% zoom, a desktop layout may collapse to the tablet layout sooner. This mirrors how native browser zoom already behaves and is generally desirable, but worth knowing so it isn't mistaken for a bug during testing.

## Testing checklist

- [ ] All 5 levels on `Header.tsx` (sticky, contains the fixed-width mega-menu)
- [ ] The three `lg:sticky` sidebar `<aside>`s (`AboutLayout`, `CampusLifeLayout`, `DepartmentLayout`, `staff.$staff.tsx`) for overlap against the header at `top-24`
- [ ] No horizontal scroll/overflow at 150% on mobile viewport widths
- [ ] Reload persists the last-picked level with no visible flash
- [ ] Keyboard-only operation and screen-reader announcement of level changes

## Research basis

- Tailwind v4.2.1, CSS-based `@theme` config in `src/styles.css` (no `tailwind.config.js`), stock rem defaults for spacing/font-size/sizing.
- No existing `html { font-size }` override; browser default 16px root in effect.
- ~115 arbitrary `px`-unit bracket values across 32 files sitewide, concentrated in admin/CMS screens; on the public site the main offenders are `Header.tsx` and `Carousel.tsx` as noted above.
- No existing persisted-preference system (no theme toggle, no localStorage-backed context) — `AdminAuthContext.tsx`'s create-context/provider/hook shape is the closest existing convention to mirror.
- Sticky elements to watch: `Header.tsx:98` (site-wide sticky header), plus `lg:sticky top-24` asides in `AboutLayout.tsx`, `CampusLifeLayout.tsx`, `DepartmentLayout.tsx`, `staff.$staff.tsx`.
