-- Phase 4 of the SYSTEM_MAP.md broken-items fix plan: anonymous inquiry/
-- grievance submissions had zero abuse protection (RLS is a bare
-- WITH CHECK (true), no IP/rate tracking exists anywhere in the schema).
-- Combined with a client-side honeypot field (added separately in
-- InquiryForm/GrievanceForm), add a lightweight server-side backstop:
-- no more than 3 submissions from the same email to the same form within
-- 10 minutes, and no more than 30 submissions to the same form within any
-- rolling minute regardless of email (covers submitters who omit email).
CREATE OR REPLACE FUNCTION public.enforce_inquiry_submission_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_email text := NEW.submitted_data->>'email';
  v_email_count int;
  v_burst_count int;
BEGIN
  IF v_email IS NOT NULL AND v_email <> '' THEN
    SELECT count(*) INTO v_email_count
    FROM public.inquiry_submissions
    WHERE form_id = NEW.form_id
      AND submitted_data->>'email' = v_email
      AND created_at > now() - interval '10 minutes';
    IF v_email_count >= 3 THEN
      RAISE EXCEPTION 'Too many submissions from this email address. Please try again later.';
    END IF;
  END IF;

  SELECT count(*) INTO v_burst_count
  FROM public.inquiry_submissions
  WHERE form_id = NEW.form_id
    AND created_at > now() - interval '1 minute';
  IF v_burst_count >= 30 THEN
    RAISE EXCEPTION 'This form is receiving too many submissions right now. Please try again shortly.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inquiry_submission_rate_limit ON public.inquiry_submissions;
CREATE TRIGGER trg_inquiry_submission_rate_limit
  BEFORE INSERT ON public.inquiry_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_inquiry_submission_rate_limit();
