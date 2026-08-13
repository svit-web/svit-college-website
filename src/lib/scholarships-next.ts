// Next.js-safe admin writes for scholarships. Runs in the browser with the
// admin's session so RLS enforces write access, same pattern as the rest of
// the admin panel (savePlacementContent, AdminCrudManager, etc).
import { createClient } from '@/app/lib/supabase/client';
import type { Scholarship } from '@/lib/scholarships-public';

export async function upsertScholarship(input: Partial<Scholarship> & { name: string; type: string }): Promise<Scholarship> {
  const supabase = createClient();
  const { id, ...fields } = input;
  if (id) {
    const { data, error } = await supabase
      .from('scholarships')
      .update({ ...fields, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as Scholarship;
  }
  const { data, error } = await supabase.from('scholarships').insert(fields as any).select().single();
  if (error) throw error;
  return data as unknown as Scholarship;
}

export async function deleteScholarship(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('scholarships').delete().eq('id', id);
  if (error) throw error;
}
