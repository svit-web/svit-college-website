# 13 — All department events show on Departmental Events pages

## Problem
Events tagged to a department showed on `/campus-life/events` but not on
`/departments/<code>/activities` unless their type was Expert Session, Industrial Visit,
Seminar, Workshop, STTP or FDP. IT's two "Technical" events (Cyber Security, 2026-10-09 and
Tech Session – RAG with Gemini, 2026-09-29) were hidden, so the page said "No events yet."

## Change
- `getDepartmentActivities()` no longer filters by `event_type`: every published event of the
  department shows, including Fest, Cultural, Technical, Sports, Competition, Other and no type.
- Cards use the shared `eventTypeLabel()`, so "Industry Visit" now reads "Industrial Visit",
  matching the admin dropdown.
- `sitemap.ts` lists a department's events page for any event type.
- The Event Type help text in admin now describes this.
- No migration and no data change.

## Verify
1. `/departments/IT/activities` shows both events, labelled Technical.
2. `/departments/CIV/activities` and `/departments/MCA/activities` still show their events.
3. `/sitemap.xml` includes `/departments/IT/activities`.
