-- Short-code display in the mega-nav chip must stay code-constrained
-- (code_format check), but some colleges (Diploma, Management) don't have a
-- recognizable acronym worth showing there. nav_label is a free-text
-- override the nav prefers over `code`, falling back to `code` when null.
alter table public.colleges add column nav_label text;

update public.colleges set nav_label = 'SVIT Diploma' where code = 'DIP';
update public.colleges set nav_label = 'SVIT Mgmt.' where code = 'MBA';

update public.colleges set name = 'Sardar Vallabhbhai Patel Institute of Technology-Diploma' where code = 'DIP';
update public.colleges set name = 'Sardar Vallabhbhai Patel Institute of Technology- Business Administration' where code = 'MBA';
