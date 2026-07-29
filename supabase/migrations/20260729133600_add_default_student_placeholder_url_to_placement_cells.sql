-- Migration: Add default_student_placeholder_url to placement_cells table

ALTER TABLE public.placement_cells ADD COLUMN IF NOT EXISTS default_student_placeholder_url text;
