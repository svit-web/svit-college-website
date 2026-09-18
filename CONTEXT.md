# SVIT College Website

Public marketing site + admin panel for SVIT Vasad, built on Next.js with Supabase as the backend.

## Language

**Overlay hero**:
A hero/banner section where text is rendered on top of a tinted, blurred photo background — the photo is decoration, not content. Used by `PageHero`, `CollegeLandingPage`, and the About/Campus Life banners. Legibility comes from `HeroAppearance`'s tint/overlay/blur/text-color fields, applied via `heroOverlayStyles()`.
_Avoid_: banner hero, background hero

**Split hero**:
A hero section where the photo and the text occupy separate, non-overlapping regions — the photo is primary content, not a text backdrop, so no tint/overlay is applied to it. Used by the homepage hero (`HeroNew`). `HeroPhotoLayer`'s `overlay` prop distinguishes this from an Overlay hero.
_Avoid_: content hero, split-screen hero

**HeroAppearance**:
The shared, admin-editable record (`app_settings` key `hero_appearance`) controlling hero photography across the site. It bundles two distinct concerns: overlay/tint config (`heroImageOpacity`, `heroOverlayOpacity`, `heroOverlayColor`, `heroTextColor`, `heroBlurPx`) that only applies to Overlay heroes, and photo assets (`homepagePhotos`, `aboutPhoto`, `campusLifePhoto`) used by both hero types.
_Avoid_: hero settings, theme settings

**Homepage photo slideshow**:
The crossfade rotation of `HeroAppearance.homepagePhotos` (up to `MAX_HOMEPAGE_PHOTOS`) rendered by `HeroPhotoLayer`, cycling every `HOMEPAGE_ROTATE_MS`. Distinct from the "Homepage Card Slider" (`heroSliderEnabled`/`HeroCardSlider`), which rotates highlight cards, not photos.
_Avoid_: hero carousel, image carousel

**Colleges mega panel** (desktop nav):
The full-width dropdown revealed when hovering "Colleges" in the desktop navbar. Shows all colleges and their departments at once in a flat, column-wrapped grid — each college is a vertical section listing its departments beneath a clickable college heading. No hover-to-reveal step within the panel. Matches the structure of `LinksMegaPanel` (used by "About SVIT").
_Avoid_: college dropdown (ambiguous — could mean the trigger or the panel), colleges nav

**College accordion row** (mobile nav):
A mobile nav pattern where each college row has two tap targets: the college name (navigates to `/colleges/[id]`) and a right-side chevron arrow (expands an inline department list). Tapping the arrow toggles the nested department links without navigating away.

**Navbar wordmark**:
The single line of text next to the logo mark in `Logo.tsx`, sourced from `ContactInfo.full_name` (admin-editable via Admin → Settings → Contact Information → "Full Name"). Falls back to "Sardar Vallabhbhai Institute of Technology" if unset. Deliberately just one line — the old two-line "SVIT Vasad" / "Institute of Technology" treatment was dropped in favor of a single dynamic name.
_Avoid_: logo text, header title
