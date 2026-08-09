# Apple Design Improvements

A record of all UI/UX improvements applied to the SVIT college website frontend, guided by Apple's design principles (chiefly *Designing Fluid Interfaces*, WWDC 2018, and *Principles of Great Design*, WWDC 2026).

---

## Commits

- `ea8468a` — feat(ui): apply Apple design principles across frontend
- `add1620` — feat(ui): additional Apple design polish — transitions, skeletons, page transitions

---

## Round 1 — Core Principles

### 1. Press Feedback on All Interactives
**Principle:** Respond on pointer-down, not release. Every interactive element must give instant visual feedback the moment it is pressed.

**Problem:** All buttons, cards, pill tabs, and gallery thumbnails had hover states but zero `:active` states. On touch devices this meant zero feedback until release.

**Files changed:** `src/styles.css`, `src/components/site/PillTabs.tsx`, `src/components/site/Header.tsx`, `src/components/site/CTABanner.tsx`, `src/components/site/DeptBranchCard.tsx`, `src/components/site/EventsNewsSlider.tsx`, `src/components/site/PlacementTestimonialsSlider.tsx`, `src/components/site/HeroCardSlider.tsx`, `src/routes/gallery.$albumId.tsx`

**Changes:**
- `card-lift` utility: added `active:scale(0.98)` with `transition-duration: 80ms`
- `PillTabs` links: `active:scale-95 active:duration-75`
- Header "Apply Now" (desktop + mobile): `active:scale-95`
- Gallery thumbnails: `active:scale-[0.97] duration-75`
- All slider prev/next buttons: `active:scale-90`
- CTA banner primary + secondary buttons: `active:scale-95`
- Lightbox close, prev, next: `active:scale-90`
- `DeptBranchCard` wrapper: `group-active:scale-[0.97]`

---

### 2. Springs Instead of Fixed-Duration Bezier
**Principle:** Pre-scripted fixed-duration animations cannot respond to new input or be interrupted. Springs animate from the current value — they are inherently interruptible.

**Problem:** `Reveal`, `PageHero`, all dropdown menus, `HeroCardSlider`, `EventsNewsSlider`, and `PlacementTestimonialsSlider` all used `ease: [0.22, 1, 0.36, 1]` with fixed durations of 0.4–0.7s.

**Files changed:** `src/components/site/Reveal.tsx`, `src/components/site/PageHero.tsx`, `src/components/site/EventsNewsSlider.tsx`, `src/components/site/PlacementTestimonialsSlider.tsx`, `src/components/site/HeroCardSlider.tsx`

**Changes:**

| Before | After |
|--------|-------|
| `duration: 0.6, ease: [0.22, 1, 0.36, 1]` | `type: "spring", bounce: 0, duration: 0.45` |
| `duration: 0.7, ease: [0.22, 1, 0.36, 1]` | `type: "spring", bounce: 0, duration: 0.5` |
| `duration: 0.5, ease: [0.22, 1, 0.36, 1]` | `type: "spring", bounce: 0, duration: 0.4` |
| `duration: 0.4` (mobile sliders) | `type: "spring", bounce: 0, duration: 0.35` |

---

### 3. DeptBranchCard — Targeted Transitions at 200ms
**Principle:** `transition-all` animates every CSS property including layout-triggering ones. Targeted transitions are both more performant and more intentional.

**Problem:** Three elements inside `DeptBranchCard` used `transition-all duration-500 ease-in-out` — 500ms is far too slow for a hover interaction.

**File changed:** `src/components/site/DeptBranchCard.tsx`

**Changes:**
- Border + shadow: `transition-[border-color,box-shadow] duration-200`
- Logo blur: `transition-[filter] duration-200`
- Overlay: `transition-opacity duration-200`
- Added `group-active:scale-[0.97]` press feedback

---

### 4. Footer Accordion — Animated Height with AnimatePresence
**Principle:** Instant show/hide (toggling `display: block/none`) is an abrupt cut. Continuous height animation communicates the relationship between trigger and content.

**Problem:** `FooterCol` toggled links between `hidden` and `block` with no transition. The chevron rotated via CSS class swap.

**File changed:** `src/components/site/Footer.tsx`

**Changes:**
- Links wrapped in `AnimatePresence` + `motion.ul` with `height: 0 → "auto"` spring
- Desktop links rendered in a separate always-visible `<ul>` (not affected)
- Chevron wrapped in `motion.div` with `animate={{ rotate: open ? 180 : 0 }}` spring

```tsx
<motion.ul
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ type: "spring", bounce: 0, duration: 0.3 }}
>
```

---

### 5. Gallery Lightbox — Animated Open/Close + Image Crossfade
**Principle:** Surfaces should materialize, not just appear. Navigation between images should be continuous, not a hard cut.

**Problem:** The lightbox appeared and disappeared instantly (no `AnimatePresence`). Navigating between images replaced the `src` attribute with no transition.

**File changed:** `src/routes/gallery.$albumId.tsx`

**Changes:**
- Lightbox wrapped in `AnimatePresence` at the call site
- Backdrop `motion.div` has `initial={{ opacity: 0 }} → animate={{ opacity: 1 }} → exit={{ opacity: 0 }}`
- Image navigation wrapped in `AnimatePresence mode="wait"` — each image is a `motion.img` keyed by URL with `scale: 0.97 → 1 → 0.97` crossfade

---

### 6. Typography — Size-Specific Letter-Spacing
**Principle:** Tracking (letter-spacing) must be size-specific. Large display text needs negative tracking; a flat value applied to all headings is wrong at every size.

**Problem:** `h1, h2, h3, h4` all shared `letter-spacing: -0.01em` regardless of their rendered size.

**File changed:** `src/styles.css`

**Before:**
```css
h1, h2, h3, h4 { font-family: var(--font-display); letter-spacing: -0.01em; }
```

**After:**
```css
h1, h2, h3, h4 { font-family: var(--font-display); }
h1 { letter-spacing: -0.03em; }
h2 { letter-spacing: -0.02em; }
h3 { letter-spacing: -0.015em; }
h4 { letter-spacing: -0.01em; }
```

---

### 7. Header — Translucent Material + Scroll-Triggered Shadow
**Principle:** Translucent materials convey depth by letting content show through. A permanent 1px border divider is a static decoration; a scroll-triggered shadow is contextual — it appears only when content is actually below the chrome.

**Problem:** `bg-white/95` made the `backdrop-blur` almost invisible (5% transparency). The `border-b border-border` was always visible regardless of scroll position.

**File changed:** `src/components/site/Header.tsx`

**Changes:**
- `bg-white/95` → `bg-white/80 backdrop-blur-md`
- `border-b border-border` removed; replaced with `transition-shadow` + scroll listener:
  ```tsx
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  ```
- Shadow: `shadow-[0_1px_12px_0_oklch(0.18_0.02_260_/_0.08)]` appears only when `scrolled === true`

---

### 8. HeroPhotoLayer — Crossfade 1000ms → 500ms
**Principle:** 1 second is too long for a hero photo rotation crossfade.

**File changed:** `src/components/site/HeroPhotoLayer.tsx`

**Change:** `transition-opacity duration-1000` → `transition-opacity duration-500`

---

### 9. Mobile Menu — Spring Height Animation
**Principle:** Fixed-duration height animations cannot carry velocity or be interrupted.

**File changed:** `src/components/site/Header.tsx`

**Change:**
```tsx
// Before
transition={{ duration: 0.15 }}

// After
transition={{ type: "spring", bounce: 0, duration: 0.3 }}
```

---

### 10. Dropdown Menus — Springs + transform-origin + Remove Hardcoded Offset
**Principle:** Menus should emerge from their trigger element, not materialize from the panel center. Hardcoded pixel offsets break at different content widths.

**File changed:** `src/components/site/Header.tsx`

**Changes:**
- All four dropdown panels (About, Admissions, Colleges, Campus Life): `duration: 0.18` → `type: "spring", bounce: 0, duration: 0.2`
- Added `scale: 0.97 → 1` in initial/exit alongside `y: 6`
- `transformOrigin: "top center"` on About and Admissions panels; `"top right"` on Colleges and Campus Life
- Colleges mega: removed `x: -190` hardcoded offset, repositioned with `right-0` CSS

---

### 11. Sliders + CTABanner — Targeted Transitions, No `transition-all`
**Principle:** `transition-all` animates layout-triggering properties unnecessarily. Explicit property lists are more performant.

**Files changed:** `src/components/site/CTABanner.tsx`, `src/components/site/PlacementTestimonialsSlider.tsx`

**Changes:**
- CTABanner buttons: `transition-all` → `transition-[background-color,transform]`
- PlacementTestimonialsSlider card: `transition-all` → `transition-[border-color]`
- Slider nav buttons: `transition-all` → `transition-[background-color,color,transform]`

---

## Round 2 — Additional Polish

### 12. Gallery Lightbox — Swipe-to-Dismiss on Mobile
**Principle:** Direct manipulation — content should follow the finger with 1:1 tracking, and the background should respond to the gesture in real time.

**File changed:** `src/routes/gallery.$albumId.tsx`

**Implementation:**
- `useMotionValue(0)` tracks `dragY`
- `useTransform(dragY, [-200, 0, 200], [0, 0.9, 0])` drives background opacity live during drag
- Image wrapped in `motion.div` with `drag="y"`, `dragConstraints={{ top: 0, bottom: 0 }}`, `dragElastic={0.25}`
- `onDragEnd`: dismiss if `|offset.y| > 80` or `|velocity.y| > 500`, otherwise spring back to 0
- Background moved to a separate `motion.div` so its opacity can be independently controlled

---

### 13. Page Transitions Between Routes
**Principle:** Navigation should feel continuous, not like loading a new document. A brief fade removes the hard cut between pages.

**File changed:** `src/routes/__root.tsx`

**Implementation:**
```tsx
<AnimatePresence mode="sync" initial={false}>
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```
- `mode="sync"` — old and new pages fade simultaneously (snappier than `"wait"`)
- `initial={false}` — skips animation on first page load

---

### 14. link-underline — Asymmetric Easing
**Principle:** Entry and exit of an animation can have different timing — fast to activate (rewards the tap), slow to retract (graceful).

**File changed:** `src/styles.css`

**Before:** `transition: background-size 300ms ease`

**After:**
```css
/* slow retract on mouse-out */
transition: background-size 350ms cubic-bezier(0.55, 0, 1, 0.45);
&:hover {
  /* fast expand on mouse-in */
  transition: background-size 220ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

### 15. News Cards — Border Hover State
**Principle:** `card-lift` already transitions `border-color`, but without a destination colour the transition is invisible.

**File changed:** `src/routes/news.tsx`

**Change:** Added `hover:border-gold/50` to news event article cards.

---

### 16. Mobile Nav Accordions — AnimatePresence Spring Height
**Principle:** All four sub-sections in the mobile menu (About SVIT, Admissions, Colleges, Campus Life) were using conditional rendering with no animation — an instant cut.

**File changed:** `src/components/site/Header.tsx`

**Changes:**
- Each section wrapped in `AnimatePresence initial={false}` + `motion.div` with spring height
- Chevron icons replaced with `motion.span` + `animate={{ rotate: open ? 180 : 0 }}` spring (instead of CSS class-based rotation)

```tsx
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.28 }}
      className="overflow-hidden"
    >
      {/* links */}
    </motion.div>
  )}
</AnimatePresence>
```

---

### 17. Skeleton Loading States
**Principle:** Continuous feedback during loading — show the shape of the content before it arrives rather than a blank page.

**Files changed:** `src/routes/news.tsx`, `src/routes/gallery.index.tsx`, `src/routes/gallery.$albumId.tsx`, `src/routes/placement.index.tsx`

**Implementation:** Each route was given a `pendingComponent` — a shimmer skeleton matching the actual page layout — shown during client-side loader execution.

| Route | Skeleton content |
|-------|-----------------|
| `/news` | Hero bar + 6 event card outlines |
| `/gallery/` | Hero bar + 6 album card outlines with aspect-video placeholder |
| `/gallery/$albumId` | Hero bar + 12 square photo grid tiles |
| `/placement/` | Hero bar + 4 stat cards + 6 recruiter logo tiles |

All skeletons use Tailwind's `animate-pulse` on `bg-navy/8` shapes.

---

## Spring Reference

All springs in this codebase use `bounce: 0` (critically damped — no overshoot) unless the interaction involved explicit momentum (flick/throw), in which case `bounce: 0.15–0.2` is appropriate. Durations follow Apple's published values:

| Use case | Duration |
|----------|----------|
| Dropdown open/close | 0.2s |
| Mobile accordion | 0.28–0.3s |
| Page transition | 0.2s |
| Reveal scroll animation | 0.45s |
| Hero entry | 0.5s |
| Slider card swap | 0.35–0.4s |
| Lightbox open/close | 0.25s |
| Image crossfade | 0.25s |
