import { queryOptions } from "@tanstack/react-query";
import {
  getCollegesGrid,
  getGlobalHomepageItems,
  getLatestEvents,
  getRecruiterLogos,
} from "./homepage.functions";
import { getAllProgrammes } from "./programmes.functions";
import { getContactInfo } from "./pages.functions";
import { getHeroAppearance } from "./theme.functions";

export type HomepageItem = Awaited<ReturnType<typeof getGlobalHomepageItems>>[number];
export type CollegeRow = Awaited<ReturnType<typeof getCollegesGrid>>[number];
export type RecruiterRow = Awaited<ReturnType<typeof getRecruiterLogos>>[number];
export type EventRow = Awaited<ReturnType<typeof getLatestEvents>>[number];

export const homepageItemsQuery = queryOptions({
  queryKey: ["homepage_items", "global"],
  queryFn: () => getGlobalHomepageItems(),
  staleTime: 60_000,
});

// staleTime 0 (not 60s like the rest): college names/logos are edited rarely,
// but every page mount (nav dropdown, homepage, /colleges) should reflect an
// admin edit immediately rather than serving a minute-old cached name.
// refetchInterval matters specifically for the header's Colleges dropdown:
// Header is a persistent layout component that never remounts on navigation,
// so without polling it would only ever refresh on window refocus/reload —
// staying wrong indefinitely in a long-lived background tab.
export const collegesQuery = queryOptions({
  queryKey: ["colleges"],
  queryFn: () => getCollegesGrid(),
  staleTime: 0,
  refetchInterval: 30_000,
});

export const recruitersQuery = queryOptions({
  queryKey: ["recruiters"],
  queryFn: () => getRecruiterLogos(),
  staleTime: 60_000,
});

export const eventsQuery = queryOptions({
  queryKey: ["events", "latest"],
  queryFn: () => getLatestEvents(),
  staleTime: 60_000,
});

export const programmesQuery = queryOptions({
  queryKey: ["programmes"],
  queryFn: () => getAllProgrammes(),
  staleTime: 60_000,
});

export const contactInfoQuery = queryOptions({
  queryKey: ["contact_info"],
  queryFn: () => getContactInfo(),
  staleTime: 60_000,
});

export const heroAppearanceQuery = queryOptions({
  queryKey: ["hero_appearance"],
  queryFn: () => getHeroAppearance(),
  staleTime: 30_000,
});

export function byType(items: HomepageItem[], type: string): HomepageItem[] {
  return items.filter((i) => i.item_type === type);
}

export function promoBySlot(items: HomepageItem[], slot: string): HomepageItem | undefined {
  return items.find(
    (i) =>
      i.item_type === "promo_card" &&
      i.metadata &&
      typeof i.metadata === "object" &&
      (i.metadata as Record<string, unknown>).slot === slot,
  );
}
