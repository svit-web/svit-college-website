// Fixed option sets for admin dropdowns, mirroring the same pattern as
// EVENT_TYPE_LABELS (src/lib/event-types.ts). Each list is the exact set the
// backend accepts for the column: either a DB CHECK constraint (downloads,
// menu_items, gallery_media) or the literal values the public site branches on
// (facilities). Extending a list means changing what the site understands —
// add the migration/code support first, then the value here.
import { ACHIEVEMENT_CATEGORY_LABELS } from "@/lib/achievements.functions";

export interface AdminOption {
  value: string;
  label: string;
}

const toOptions = (labels: Record<string, string>): AdminOption[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/** achievements.category — CHECK constraint on the table; also drives where an
 *  achievement surfaces publicly (sports achievements are merged into the
 *  Sports section via category='sports'). */
export const ACHIEVEMENT_CATEGORY_OPTIONS: AdminOption[] = toOptions(ACHIEVEMENT_CATEGORY_LABELS);

/** downloads.category — CHECK constraint; any other value is rejected on save. */
export const DOWNLOAD_CATEGORY_OPTIONS: AdminOption[] = toOptions({
  circular: "Circular",
  notice: "Notice",
  syllabus: "Syllabus",
  form: "Form",
  other: "Other",
});

/** menu_items.menu_type — CHECK constraint; decides how the Header renders the
 *  item (mega panels vs a plain link). Unknown values render as "simple". */
export const MENU_TYPE_OPTIONS: AdminOption[] = toOptions({
  simple: "Simple Link",
  links_mega: "Column of Links (About / Admissions pages)",
  colleges_mega: "Colleges Mega Panel",
  campus_mega: "Campus Mega Panel",
  placement_mega: "Placement Mega Panel",
});

/** facilities.category — no DB constraint, but the public Facilities page only
 *  renders rows in exactly these two buckets (campus-life/facilities/page.tsx);
 *  anything else never appears on the site. */
export const FACILITY_CATEGORY_OPTIONS: AdminOption[] = toOptions({
  academic: "Academic",
  amenities: "Amenities",
});

/** sports.category — the public SportsSection labels and tallies these. */
export const SPORT_CATEGORY_OPTIONS: AdminOption[] = toOptions({
  outdoor: "Outdoor",
  indoor: "Indoor",
  aquatic: "Aquatic",
  combat: "Combat",
});

/** gallery_media.media_type — CHECK constraint allows 'image' only (video was
 *  dropped, see 20261003142230 migration); any other value silently vanishes
 *  from public galleries. */
export const GALLERY_MEDIA_TYPE_OPTIONS: AdminOption[] = [{ value: "image", label: "Image" }];
