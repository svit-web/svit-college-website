# SVIT College Website

Public marketing site + admin panel for SVIT Vasad, built on Next.js with Supabase as the backend.

## Language

**Photo hero**:
A full-bleed photo hero whose text sits on a paper-coloured fade down the left side (`heroFadeStyles()`), with an optional tint over the photo (`heroOverlayStyles()`). Used by the homepage (`HeroNew`) and college landing pages (`CollegeLandingPage`); the college hero additionally applies the whole-photo Background Blur. Replaced the old navy "Overlay hero" in the beige redesign (2026-09).
_Avoid_: overlay hero, background hero

**Page banner**:
The beige, photo-less banner at the top of inner pages (`PageHero`, also used by the department, About and Campus Life layouts): breadcrumbs, small crimson eyebrow, title, one subtitle line, optional pills/actions — deliberately slim (no viewport-height minimum) so page content starts near the top of the first screen. Only the admin Text Color affects it.
_Avoid_: page hero (ambiguous with Photo hero)

**Section tab strip**:
The horizontally scrolling row of section pills (`SectionTabs`) mounted in a sticky strip directly below the Page banner on section layouts (department, About, Campus Life). It replaced the old vertical `SectionSideNav` sidebar; active section = ink pill, and the strip sticks under the navbar while the page scrolls, releasing at the end of the content so it never overlaps the footer. Distinct from `PillTabs`, which links peer entries inside a page (e.g. clubs), not page sections.
_Avoid_: sidebar nav, section sidebar (the vertical layout is gone)

**Split hero**:
A section where the photo and the text occupy separate, non-overlapping regions, so the photo is shown untinted — e.g. the homepage carousel (`Carousel.tsx`). `HeroPhotoLayer`'s `overlay={false}` renders a photo this way.
_Avoid_: content hero, split-screen hero

**HeroAppearance**:
The shared, admin-editable record (`app_settings` key `hero_appearance`) controlling hero photography across the site. It bundles two distinct concerns: overlay/tint config (`heroImageOpacity`, `heroOverlayOpacity`, `heroOverlayColor`, `heroTextColor`, `heroBlurPx`) that applies to Photo heroes (text colour: every hero, via `--hero-text` set in the public site layout), and photo assets (`homepagePhotos`, `aboutPhoto`, `campusLifePhoto`) used by both hero types.
_Avoid_: hero settings, theme settings

**Homepage photo slideshow**:
The crossfade rotation of `HeroAppearance.homepagePhotos` (up to `MAX_HOMEPAGE_PHOTOS`) rendered by `HeroPhotoLayer`, cycling every `HOMEPAGE_ROTATE_MS`. Distinct from the "Homepage Card Slider" (`heroSliderEnabled`/`HeroCardSlider`), which rotates highlight cards, not photos.
_Avoid_: hero carousel, image carousel

**Colleges mega panel** (desktop nav):
The full-width dropdown revealed when hovering "Colleges" in the desktop navbar. Shows all colleges and their departments at once in a flat, column-wrapped grid — each college is a vertical section listing its departments beneath a clickable college heading. No hover-to-reveal step within the panel. Matches the structure of `LinksMegaPanel` (used by "About SVIT").
_Avoid_: college dropdown (ambiguous — could mean the trigger or the panel), colleges nav

**College accordion row** (mobile nav):
A mobile nav pattern where each college row has two tap targets: the college name (navigates to `/colleges/[id]`) and a right-side chevron arrow (expands an inline department list). Tapping the arrow toggles the nested department links without navigating away.

**Mobile nav drawer**:
The hamburger panel on small breakpoints. It has no item list of its own — it renders the same main navigation items as the desktop navbar, in the same order: mega items (About SVIT, Admissions, Colleges, Campus Life) as accordion rows and every other item as a plain link. Adding or reordering a main navigation item in admin changes both breakpoints; only the drawer's pinned extras (utility links, a11y toggles, socials) are drawer-specific.
_Avoid_: hamburger menu, mobile menu (implies a separate, second menu to maintain)

**Entry**:
Any admin-managed content item that the public site shows as a Card — a facility, lab, event, news post, achievement, club, sport, etc. Every Entry has a title, a description and at most one Card photo; it may also have an Entry album and a Detail page.
_Avoid_: item, record, object, post (post is one kind of Entry)

**Card**:
The compact tile showing an Entry in a grid or list: Card photo, title, and a clamped description. A Card with neither a Detail page nor an Entry album is not clickable.
_Avoid_: tile, box

**Card photo**:
The Entry album photo tagged `is_cover` — not a separate image or column. An admin picks it by uploading the first photo for an Entry (automatic) or clicking "Set cover" on any other photo in the album (`EntryPhotosEditor`). Because it's just a tagged album photo, it also appears in the Entry album/Entry viewer like any other photo. (Superseded the old model where the Card photo lived in its own `card_photo_url` column, separate from the album — see ADR 0004.)
_Avoid_: thumbnail, featured image, cover image (the admin UI and code currently use all three)

**Entry album**:
The set of photos belonging to one Entry, stored as a gallery album — one of them tagged `is_cover` is also the Card photo. It exists independently of the Detail page: an Entry can have an album without a page. An Entry with any photo always has an album (the first upload creates one).
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

**Work Experience**:
A row in `staff_work_experience`: one position a faculty/staff member held — position, organization, a start month+year, and either an end month+year or "Currently Working". Tagged **Industry** or **Teaching/Academic**. A faculty member's current SVIT post is itself one of these entries (marked Currently Working), not a separate "joining year" field. Shown as a chronological timeline on the faculty member's own profile page; on a department's staff listing, only the per-category year totals show (e.g. "8 yrs industry · 12 yrs teaching"), not the entries themselves. Distinct from `staff_achievements` (qualifications, awards, patents, publications, research, activities), which stays free-text.
_Avoid_: experience achievement, job history

**Event type**:
The fixed category of an Event (Fest, Cultural, Technical, Sports, Workshop, Seminar, Expert Session, STTP, FDP, Industrial Visit, Competition, Other). Chosen from a fixed list, never typed in freely. It says what the Event _is_, while its college, department or club says whose it is.
_Avoid_: tag, category

**Detail page**:
An Entry's own URL showing the Entry album as a slideshow, the full description and type-specific facts. An admin turns it on per Entry; on by default for new Entries since 2026-10 (except Sports, which has no Detail page route yet, so the flag is a no-op there).
_Avoid_: is_page, inner page, subpage

**Committee member**:
A person serving on a committee — a row in `committee_members` (committee, name, position, designation, contact, sort order). A **Linked** member carries a `staff_profile_id` (set automatically at migration time when the member's email matched exactly one live Staff profile); an **External** member is not staff and is held as free text only.
_Avoid_: committee JSON, members array

**Course**:
A `courses` row with `department_id` set — belongs to one department (and transitively one college). Every admissions-editable field (intake, fees, duration, eligibility, brochure) lives on this row. Distinct from a Programme, which is a different kind of `courses` row.
_Avoid_: programme (only when `department_id` is set), subject

**Programme**:
A `courses` row with `is_programme = true` and `department_id` left NULL — a standalone landing page at `/programs/[program]`, not scoped to any department or college. Writable only by global admins today; excluded from the Admissions section grant and from the public intake/fees table, which lists Courses only.
_Avoid_: course (the two are deliberately different kinds of row, despite sharing a table)

**Admissions section**:
A row in `admin_sections` (code `'admissions'`) granting write access to admissions-related admin pages via `user_section_grants`, independent of a user's scope-tier role (global/college/department admin). Distinct from the public "Admissions" nav item/page and from "Admissions Details" (the admin tab it unlocks).
_Avoid_: admissions role, admissions permission

**Section grant**:
A `user_section_grants` row giving a user write access to one Admin section (e.g. Admissions, Sports) at a chosen scope, independent of and additive to their scope-tier role (`department_admin`, `college_admin`, etc.). Assigned via User Management → "Manage roles" → Section Access. RLS enforces it at the row level only — it cannot restrict which columns of a row a grant-holder writes.
_Avoid_: section role, section permission

**Campus life tile**:
One of up to 11 `homepage_items` rows (`item_type = 'campus_life_tile'`) rendered by `CampusLifeSection` in the "Life beyond the classroom" homepage grid. Has its own editorial title, eyebrow label and photo (`image_url`), independent of any Entry it may point to — unlike a Card, whose title and photo always come from the Entry it shows. Optionally carries a Tile destination.
_Avoid_: campus life card (it is not a Card), homepage card

**Tile destination**:
The optional navigation target of a Campus life tile, resolved to a URL at render time rather than stored as one. One of: a specific Entry (Facility, Student Club or Event, referenced by id — resolves to that Entry's current Detail page), a fixed Campus Life section (Overview/Facilities/Student Groups/Events/Sports & Athletics/NSS-NCC), a Custom URL, or none. If an Entry target becomes unavailable (unpublished, deleted, or its Detail page turned off), the tile stays visible with its photo and text but drops the link rather than pointing at a dead page.
_Avoid_: tile link, link_href (that column covers only the Custom URL case, not the whole concept)

**Navbar wordmark**:
The single line of text next to the logo mark in `Logo.tsx`, sourced from `ContactInfo.full_name` (admin-editable via Admin → Settings → Contact Information → "Full Name"). Falls back to "Sardar Vallabhbhai Institute of Technology" if unset. Deliberately just one line — the old two-line "SVIT Vasad" / "Institute of Technology" treatment was dropped in favor of a single dynamic name.
_Avoid_: logo text, header title

**Leadership message**:
The Chairman's or Principal's message shown on the SVIT-wide About pages (`/about/chairman-message`, `/about/principal-message`), stored as a single record each in `pages.metadata.leadership.chairman` / `.principal` (the `about` page row) and edited on the About SVIT admin page. Despite multi-college being core elsewhere, this is deliberately a single trust-wide pair, not one per college — a separate, currently unused set of per-college columns (`colleges.principal_name/title/message/photo_url`, rendered by `PrincipalSection` on college landing pages) exists but is out of scope for this concept (2026-10).
_Avoid_: principal message (ambiguous with the per-college `colleges.principal_*` fields), leadership JSON
