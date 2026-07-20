-- Enable Public SELECT Access for Website Visitors on Supabase Cloud
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/agezrfclusigfqysbxwb/sql)

-- 1. Enable RLS and add public SELECT policies on core tables

-- Menus & Menu Items
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read menus" ON public.menus;
CREATE POLICY "Public read menus" ON public.menus FOR SELECT USING (true);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read menu_items" ON public.menu_items;
CREATE POLICY "Public read menu_items" ON public.menu_items FOR SELECT USING (true);

-- Colleges
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read colleges" ON public.colleges;
CREATE POLICY "Public read colleges" ON public.colleges FOR SELECT USING (true);

-- Recruiters
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read recruiters" ON public.recruiters;
CREATE POLICY "Public read recruiters" ON public.recruiters FOR SELECT USING (true);

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);

-- Homepage Items
ALTER TABLE public.homepage_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read homepage_items" ON public.homepage_items;
CREATE POLICY "Public read homepage_items" ON public.homepage_items FOR SELECT USING (true);

-- Trusts
ALTER TABLE public.trusts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read trusts" ON public.trusts;
CREATE POLICY "Public read trusts" ON public.trusts FOR SELECT USING (true);

-- Institutes
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read institutes" ON public.institutes;
CREATE POLICY "Public read institutes" ON public.institutes FOR SELECT USING (true);

-- Departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

-- Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

-- Staff Profiles
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read staff_profiles" ON public.staff_profiles;
CREATE POLICY "Public read staff_profiles" ON public.staff_profiles FOR SELECT USING (true);

-- Designations
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read designations" ON public.designations;
CREATE POLICY "Public read designations" ON public.designations FOR SELECT USING (true);

-- Inquiry Submissions (Allow Public INSERTs for Form Submissions)
ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert inquiry_submissions" ON public.inquiry_submissions;
CREATE POLICY "Public insert inquiry_submissions" ON public.inquiry_submissions FOR INSERT WITH CHECK (true);
