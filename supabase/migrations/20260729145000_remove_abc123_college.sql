-- Migration: Remove the 'abc123' test/dummy college entry

DELETE FROM public.colleges WHERE slug = 'abc123';
