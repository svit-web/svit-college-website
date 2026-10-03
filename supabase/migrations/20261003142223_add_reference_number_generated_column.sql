-- COSMETIC gap: GrievanceForm generates and shows a client-side reference
-- number but never persists it as a queryable column — admins could not
-- look a grievance up by the reference number they give a complainant.
-- Add it as a generated column off the existing submitted_data jsonb (no
-- backfill needed for old rows with no reference_number key) plus a
-- partial index for lookups.

ALTER TABLE public.inquiry_submissions
  ADD COLUMN reference_number text GENERATED ALWAYS AS (submitted_data ->> 'reference_number') STORED;

CREATE INDEX idx_inquiry_submissions_reference_number
  ON public.inquiry_submissions (reference_number)
  WHERE reference_number IS NOT NULL;
