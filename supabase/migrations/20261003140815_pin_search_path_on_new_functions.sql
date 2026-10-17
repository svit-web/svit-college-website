-- Close the mutable-search_path warning the two new functions from this
-- phase introduced (flagged by mcp__supabase__get_advisors) — pin both to
-- the schema they actually use, matching Postgres/Supabase best practice.
ALTER FUNCTION public.save_placement_content(jsonb, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.enforce_inquiry_submission_rate_limit() SET search_path = public;
