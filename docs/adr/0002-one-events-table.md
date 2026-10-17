# One events table for institute, college, department and club events

`club_events` and `department_activities` were folded into `events`. An Event now optionally belongs to a club (`club_id`) as well as to its scope (institute, college or department), and has a fixed `event_type` chosen from a dropdown. MoUs are not Events, so `mous` is the only place they live. Sports achievements were folded into `achievements`, and sports facilities into `sports`, for the same reason: one concept, one table, one admin screen.

## Consequences

- The department "Activities" tab, club pages and `/campus-life/events` are filtered views of the same table.
- Adding an Event type is a code change to the enum, not an admin action. This is deliberate: a fixed list keeps typos from creating duplicate types.
