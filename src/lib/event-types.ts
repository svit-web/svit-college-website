// Event type (CONTEXT.md): the fixed category of an Event. The value list is
// the DB enum `event_type_enum`; adding a type is a code change (a migration
// plus a label here), never an admin action — see docs/adr/0002-one-events-table.md.
import type { Database } from "@/integrations/supabase/types";

export type EventType = Database["public"]["Enums"]["event_type_enum"];

/** Human-readable label for every `event_type_enum` value, in enum order. */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  fest: "Fest",
  cultural: "Cultural",
  technical: "Technical",
  sports: "Sports",
  workshop: "Workshop",
  seminar: "Seminar",
  expert_session: "Expert Session",
  sttp: "STTP",
  fdp: "FDP",
  industrial_visit: "Industrial Visit",
  competition: "Competition",
  other: "Other",
};

export function eventTypeLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  return EVENT_TYPE_LABELS[type as EventType] ?? null;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", DATE_FORMAT);
}

/** "12 Mar 2026", or "12 Mar 2026 – 14 Mar 2026" for a multi-day Event. */
export function formatEventDates(start: string, end?: string | null): string {
  const from = formatDate(start);
  if (!end) return from;
  const to = formatDate(end);
  return to === from ? from : `${from} – ${to}`;
}
