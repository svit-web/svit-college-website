-- Migration: Add placed_students to placement_cells table for dynamic student list

ALTER TABLE public.placement_cells ADD COLUMN IF NOT EXISTS placed_students jsonb NOT NULL DEFAULT '[]'::jsonb;
