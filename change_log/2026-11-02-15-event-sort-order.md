# 15 — Sort order for events on department, club and centre pages

## Rule (`compareEventsBySortOrder` in `src/lib/event-types.ts`)
- Events with a `sort_order` come first, lowest number first, negatives included.
- `sort_order` 0 (the column default) means "not set": those events follow, newest date first.

## Where it applies
- Department Departmental Events page, club pages (preview and "View more") and the CoE and
  NSS / NCC pages.
- The sitewide Events page, Campus Life overview, the Campus Life menu and the homepage keep
  sorting by date. Departments number their own events independently (EE 1–23, AE -1 to -5,
  EC -23), so the numbers can't be compared across departments.

## Notes
- No migration and no data change: 62 of the 71 published events already had hand-entered values,
  which now take effect on their own pages.
- `getClubEvents` and `getCenterEvents` now fetch the owner's events and cap in code, since
  "0 last" can't be expressed as a PostgREST order.
- The admin Sort Order field on Events has help text explaining this.

## Verify
1. `/departments/EE/activities` lists its events by number, 1 first, then any with 0.
2. `/departments/AE/activities` starts with its negative numbers (-5 first).
3. In admin, set an event's Sort Order to 0: it moves after the numbered events, by date.
