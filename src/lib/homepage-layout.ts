// Order and visibility of the movable homepage sections (app_settings key
// `homepage_layout`). The hero is pinned first and the popup has its own
// setting, so neither appears here. Shared by the public read
// (homepage-layout.functions.ts), the admin write (homepage-layout-next.ts),
// the homepage renderer and the admin Layout tab.

export const HOMEPAGE_LAYOUT_KEY = "homepage_layout";

export const HOMEPAGE_SECTIONS = [
  { id: "colleges", label: "Our Colleges", hint: "Grid of constituent colleges" },
  { id: "carousel", label: "Carousel", hint: "Slides from Homepage Items" },
  { id: "stats", label: "Stats strip", hint: "Live and curated figures" },
  { id: "campus_life", label: "Life beyond the classroom", hint: "Campus life tiles" },
  { id: "why", label: "Why SVIT", hint: "Icon cards" },
  { id: "trust", label: "Trust band", hint: "Trust badges" },
  { id: "news_events", label: "News & Events", hint: "Latest events and featured posts" },
  { id: "recruiters", label: "Recruiters", hint: "Recruiter logo marquee" },
  { id: "cta", label: "CTA banner", hint: "Closing call to action" },
] as const;

export type HomepageSectionId = (typeof HOMEPAGE_SECTIONS)[number]["id"];

export interface HomepageLayoutEntry {
  id: HomepageSectionId;
  visible: boolean;
}

export const DEFAULT_HOMEPAGE_LAYOUT: HomepageLayoutEntry[] = HOMEPAGE_SECTIONS.map((s) => ({
  id: s.id,
  visible: true,
}));

/**
 * Tolerant parse: unknown ids and duplicates are dropped, sections missing from
 * the saved value are appended as visible, anything malformed gives the default.
 */
export function parseHomepageLayout(value: unknown): HomepageLayoutEntry[] {
  if (!Array.isArray(value)) return DEFAULT_HOMEPAGE_LAYOUT;
  const known = new Set<string>(HOMEPAGE_SECTIONS.map((s) => s.id));
  const seen = new Set<string>();
  const out: HomepageLayoutEntry[] = [];
  for (const raw of value) {
    const id = (raw as { id?: unknown } | null)?.id;
    if (typeof id !== "string" || !known.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id: id as HomepageSectionId,
      visible: (raw as { visible?: unknown }).visible !== false,
    });
  }
  for (const s of HOMEPAGE_SECTIONS) {
    if (!seen.has(s.id)) out.push({ id: s.id, visible: true });
  }
  return out;
}
