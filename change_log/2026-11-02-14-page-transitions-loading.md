# 14 — Page transitions, loading indicator, larger recruiter marquee

## Loading indicator (public site + admin)
- `NavigationSpinner` (mounted once in the root layout): a centred spinner with "Loading…" over
  a faded screen. It appears on an internal link click or Back/Forward if the page takes longer
  than 0.2 s, and stays at least 0.3 s. Clicks pass through, so menus stay usable.
- It ignores new-tab clicks, downloads, `#section` links, links to the current page and files
  from `/public`. A 15 s timeout stops it sticking if a click never changes the URL.
- It replaces the thin `.route-progress` bar, which is removed.
- Shared state lives in `src/lib/navigation-progress.ts`. Next changes the URL as soon as a
  `loading.tsx` commits, so `NavigationHold` in each fallback keeps the spinner up until the real
  page arrives.

## Skeletons
- `PageSkeleton` (text / cards / hero) in `(site)/loading.tsx`, plus `campus-life`, `gallery`,
  `colleges/[college]` and `departments/[dept]`. Department tabs stay on screen around it.
- Admin gets its own simple `admin/(dashboard)/loading.tsx`.

## Page transition (public site only, `PageTransition.tsx`)
- The old page slides left and fades from the moment of the click; the new page slides in from
  the right. Back reverses the direction. Header and Footer don't move.
- Reduced-motion users get no slide, as before.
- A prefetched page can arrive before the slide-out finishes, which goes straight to the slide-in.
- To turn the slide off, revert `PageTransition.tsx`'s motion props to a plain fade; nothing else
  depends on them.

## Recruiters marquee (home + college pages)
- Logos 32px → 48px, company names 1.05rem → 1.35rem, wider gap, "Our Recruiters" heading xs → sm.

No migration.

## Verify
1. Slow the network in dev tools and click a link: the page slides out, the spinner appears over
   the faded screen, then the new page slides in.
2. Back slides the other way. `#` links and new-tab links show no spinner.
3. No sideways scrollbar at phone width.
