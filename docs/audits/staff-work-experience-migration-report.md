# Work-experience migration: rows that didn't auto-migrate

`20261005120000_staff_work_experience.sql` migrated 463 of 467 live
`staff_achievements` rows with `type='experience'` into the new
`staff_work_experience` table (position/organization/start+end month+year/
category/currently-working). The 4 rows below didn't match the expected
`"<Position> at <Organization>"` + `extra.from`/`extra.to` shape (or had a
swapped from/to pair) and were left untouched in `staff_achievements`
(still live, `type='experience'`) for a department admin to re-enter by
hand as a proper Work Experience entry on the faculty member's profile,
then delete from here via the Achievements tab.

| Staff | Email | Original title | Year | Description | Notes |
|---|---|---|---|---|---|
| Aakash Navinkumar Mehta | temp@email.com | "assit prof" | 2001 | — | Looks like leftover test data — no organization, no dates captured. Likely safe to delete outright rather than re-enter. |
| Aakash Navinkumar Mehta | temp@email.com | "pro" | 2024 | — | Same as above — leftover test data. |
| Devesh P Soni | hod.civil@svitvasad.ac.in | "Principal thing" | 2028 (future, invalid) | "svit" | Real staff member, but the entry is clearly a placeholder/test value (future year, no real position or organization). Needs a real Work Experience entry re-entered from scratch. |
| Ketan R Tandel | ketantandel.ic@svitvasad.ac.in | "Teaching Assistant at Sardar Vallabhbhai Patel National Institute of Technology, Surat" | — | — | Real data, but `from`/`to` dates were swapped in the legacy import (`from: 15-03-2021`, `to: 15-02-2021` — ends before it starts). Re-enter as Teaching Assistant at SVNIT Surat with the dates the other way round (most likely 15-02-2021 → 15-03-2021, but confirm with the faculty member). |

Once each row above has a correct `staff_work_experience` entry, delete
the corresponding `staff_achievements` row from the Achievements tab (or
via the Trash page) so it stops showing up in future audits of this type.
