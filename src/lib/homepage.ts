import {
  getCollegesGrid,
  getGlobalHomepageItems,
  getLatestEvents,
  getRecruiterLogos,
} from "./homepage.functions";

export type HomepageItem = Awaited<ReturnType<typeof getGlobalHomepageItems>>[number];
export type CollegeRow = Awaited<ReturnType<typeof getCollegesGrid>>[number];
export type RecruiterRow = Awaited<ReturnType<typeof getRecruiterLogos>>[number];
export type EventRow = Awaited<ReturnType<typeof getLatestEvents>>[number];

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
