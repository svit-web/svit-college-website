// Next.js-safe admin writes for the Admissions ▸ Details tab. Runs in the
// browser with the admin's session so RLS enforces write access (global/
// scoped admin, or the 'admissions' section grant) — same pattern as
// scholarships-next.ts / AdminCrudManager.
import { createClient } from '@/app/lib/supabase/client';

export interface AdmissionsDetailsUpdate {
  id: string;
  intake: number | null;
  fees_per_semester: string | null;
  duration: string | null;
  eligibility: string | null;
  brochure_file_url: string | null;
}

export async function updateCourseAdmissionsDetails(input: AdmissionsDetailsUpdate): Promise<void> {
  const supabase = createClient();
  const { id, ...fields } = input;
  const { error } = await supabase
    .from('courses')
    .update({ ...fields, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) throw error;
}
