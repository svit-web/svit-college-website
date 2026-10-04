# Content stays in metadata JSON behind typed form editors; identifiers and staff links get columns

Most public-site content living in per-table `metadata` jsonb columns (committee vision/mission,
course highlights, department careers, sports venue, the `pages` singletons' sections, …) stays
there — it is edited through typed admin form fields, not promoted to real columns. The exceptions
are deliberate: identifiers that code joins on become columns (`inquiry_forms.slug`), and people
who mirror staff become child tables (`committee_members`), because both need integrity JSON can't
give. Rejected alternative: promoting every public-facing key to a column/child table now — more
schema churn than the editing problem justifies; revisit if a key starts needing constraints,
joins or querying (2026-10).

## Consequences

- `AdminCrudManager` renders metadata as per-key typed inputs inside a collapsed Advanced section
  (raw JSON behind a toggle), so no editor has to hand-write JSON.
- Import/migration leftovers (`legacy_id`, `legacy_source`, `auto_imported`, …) stay in metadata
  untouched; duplicate/dead keys are merged into real columns and dropped, not kept.
- Adding a new metadata key still requires a code change to get a labeled field; unknown keys
  render as generic inputs.
