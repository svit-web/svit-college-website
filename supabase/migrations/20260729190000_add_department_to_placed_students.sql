-- Add department column to placed_students table
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.placed_students
  ADD COLUMN IF NOT EXISTS department text;

-- Update seeded sample data with department names
UPDATE public.placed_students SET department = 'Computer Engineering'   WHERE student_name IN ('Raj Patel','Amit Sharma','Priya Trivedi','Karan Shah') AND college_code = 'svit-degree';
UPDATE public.placed_students SET department = 'Information Technology' WHERE student_name IN ('Sneha Reddy','Rahul Gupta','Deepa Nair') AND college_code = 'svit-degree';
UPDATE public.placed_students SET department = 'Mechanical Engineering' WHERE student_name IN ('Vikram Joshi') AND college_code = 'svit-degree';
UPDATE public.placed_students SET department = 'Civil Engineering'      WHERE student_name IN ('Anita Desai') AND college_code = 'svit-degree';
UPDATE public.placed_students SET department = 'B.Arch'                 WHERE college_code = 'svit-coa';
UPDATE public.placed_students SET department = 'MCA'                    WHERE student_name IN ('Dhruv Modi','Sonu Patel') AND college_code = 'svica';
UPDATE public.placed_students SET department = 'BCA'                    WHERE student_name IN ('Kriti Joshi') AND college_code = 'svica';
UPDATE public.placed_students SET department = 'B.Sc Nursing'           WHERE college_code = 'svion';
