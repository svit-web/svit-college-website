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

**Entry**:
Any admin-managed content item that the public site shows as a Card — a facility, lab, event, news post, achievement, club, sport, etc. Every Entry has a title, a description and at most one Card photo; it may also have an Entry album and a Detail page.
_Avoid_: item, record, object, post (post is one kind of Entry)

**Card**:
The compact tile showing an Entry in a grid or list: Card photo, title, and a clamped description. A Card with neither a Detail page nor an Entry album is not clickable.
_Avoid_: tile, box

**Card photo**:
The single image an admin picks to represent an Entry on its Card. It is separate from the Entry album, so reordering album photos never changes it.
_Avoid_: thumbnail, featured image, cover image (the admin UI and code currently use all three)

**Entry album**:
The optional set of extra photos belonging to one Entry, stored as a gallery album. It exists independently of the Detail page: an Entry can have an album without a page.
_Avoid_: gallery (the public Gallery section is a different thing), images

**Entry viewer**:
The lightbox opened by clicking a Card that has no Detail page but has more to show — an Entry album and/or a description longer than the Card displays. Shows the photos and the full description. A Card with nothing more to show is not clickable.
_Avoid_: modal, popup, show more

**Event**:
An Entry with a fixed date (or date range) and a venue — something people can attend.
_Avoid_: activity, programme

**News**:
An Entry announcing something that happened or will happen, which is not itself something to attend. News and Events are separate kinds; an Event is not News just because it is recent.
_Avoid_: blog, post, update, announcement

**Achievement**:
An Entry recording that a student, team or department won or earned something (a prize, a rank, a selection). Institute-level announcements such as accreditations are News, not Achievements. A faculty member's awards and publications are part of their staff profile, not Achievements.
_Avoid_: award, recognition

**Event type**:
The fixed category of an Event (Fest, Cultural, Technical, Sports, Workshop, Seminar, Expert Session, STTP, FDP, Industrial Visit, Competition, Other). Chosen from a fixed list, never typed in freely. It says what the Event *is*, while its college, department or club says whose it is.
_Avoid_: tag, category

**Detail page**:
An Entry's own URL showing the Entry album as a slideshow, the full description and type-specific facts. An admin turns it on per Entry, and it is off by default for new Entries.
_Avoid_: is_page, inner page, subpage

**Navbar wordmark**:
The single line of text next to the logo mark in `Logo.tsx`, sourced from `ContactInfo.full_name` (admin-editable via Admin → Settings → Contact Information → "Full Name"). Falls back to "Sardar Vallabhbhai Institute of Technology" if unset. Deliberately just one line — the old two-line "SVIT Vasad" / "Institute of Technology" treatment was dropped in favor of a single dynamic name.
_Avoid_: logo text, header title
