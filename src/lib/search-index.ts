import Fuse from "fuse.js";

// Group display order — primary discovery entities first (what a
// prospective student/parent is most likely looking for), static
// informational pages last since they're the catch-all bucket.
export const TYPE_ORDER = [
  "College",
  "Department",
  "Course",
  "Staff",
  "Event",
  "Facility",
  "Club",
  "Centre",
  "Gallery",
  "Page",
] as const;

// A union of the literal strings above, not `string` — so a typo or a new
// content type added to the crawl script without a matching TYPE_ORDER entry
// is a compile error here, instead of silently vanishing from every search
// result at runtime (groupSearchResults only keeps entries whose type is in
// TYPE_ORDER).
export type SearchEntryType = (typeof TYPE_ORDER)[number];

// Populated by scripts/build-search-index.ts, served as a static asset from
// public/search-index.json. See docs/design/SEARCH_PLAN.md — the entries
// here come from crawling this site's own rendered <title>/<h1-h4>/meta
// description, not a database query, so this type is the shared contract
// between the crawl script and the client search UI.
export interface SearchEntry {
  url: string;
  type: SearchEntryType;
  college: string | null;
  title: string;
  description: string;
  headings: string;
}

// Per-group cap in the dropdown, the only surface results are shown on
// (there's no separate /search results page). Every content type except
// Staff (~250 rows) has well under this many rows total, so in practice this
// only ever truncates Staff — everything else shows in full.
export const RESULTS_PER_GROUP = 30;

let cachedIndex: Promise<SearchEntry[]> | null = null;

/**
 * Fetches public/search-index.json once per page session and shares that
 * result across every caller. The index is a build-time artifact — see the
 * "Index freshness" row in docs/design/SEARCH_PLAN.md — so re-fetching it
 * mid-session would only ever return the same content.
 */
export function loadSearchIndex(): Promise<SearchEntry[]> {
  if (!cachedIndex) {
    cachedIndex = fetch("/search-index.json")
      .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : []))
      .catch(() => []);
  }
  return cachedIndex;
}

export function createSearchFuse(entries: SearchEntry[]): Fuse<SearchEntry> {
  return new Fuse(entries, {
    keys: [
      { name: "title", weight: 0.5 },
      { name: "headings", weight: 0.3 },
      { name: "description", weight: 0.15 },
      { name: "college", weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

export function groupSearchResults(
  entries: SearchEntry[],
): Array<[SearchEntryType, SearchEntry[]]> {
  const byType = new Map<SearchEntryType, SearchEntry[]>();
  for (const entry of entries) {
    const bucket = byType.get(entry.type);
    if (bucket) bucket.push(entry);
    else byType.set(entry.type, [entry]);
  }
  return TYPE_ORDER.filter((type) => byType.has(type)).map((type) => [type, byType.get(type)!]);
}
