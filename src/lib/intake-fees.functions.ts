import { publicSupabase } from '@/lib/supabase-public';

export interface CourseWithCollegeInfo {
  id: string;
  name: string;
  code: string;
  degree_level: string;
  intake: number | null;
  fees_per_semester: string | null;
  metadata: Record<string, any>;
  department_name: string;
  college_name: string;
  college_slug: string;
}

export async function getAllCoursesWithIntakeFees() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, name, code, degree_level, intake, fees_per_semester, metadata,
      departments!inner (
        name,
        colleges!inner (
          name,
          slug
        )
      )
    `)
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching courses with intake/fees:', error);
    throw error;
  }

  return ((data as any[]) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    degree_level: c.degree_level,
    intake: c.intake,
    fees_per_semester: c.fees_per_semester,
    metadata: c.metadata ?? {},
    department_name: c.departments?.name ?? '',
    college_name: c.departments?.colleges?.name ?? '',
    college_slug: c.departments?.colleges?.slug ?? '',
  })) as CourseWithCollegeInfo[];
}
