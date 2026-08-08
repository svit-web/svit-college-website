-- Adds a short line of text that renders above the hero eyebrow badge
-- (e.g. "Sardar Vallabhbhai Patel Institute of Technology" above "Est. 1997 · Vasad, Gujarat").
ALTER TABLE public.homepage_items ADD COLUMN pretitle text;
