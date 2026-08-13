import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { publicSupabase } from '@/lib/supabase-public';

// Next.js admin panel writes go through upsertScholarshipNext / deleteScholarshipNext
// in src/lib/scholarships-next.ts instead of the createServerFn exports below,
// which depend on the Vite-only supabase client and TanStack Start's server
// function runtime — neither available under Next.js.

export interface Scholarship {
  id: string;
  name: string;
  type: string;
  description: string | null;
  eligibility: string | null;
  amount: string | null;
  provider: string | null;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getAllScholarships() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }

  return data as Scholarship[];
}

export async function getAllScholarshipsAdmin() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching scholarships:', error);
    throw error;
  }

  return data as Scholarship[];
}

export const upsertScholarship = createServerFn({ method: 'POST' })
  .validator((input: Partial<Scholarship> & { name: string; type: string }) => input)
  .handler(async (ctx) => {
    const { id, ...fields } = ctx.data;
    if (id) {
      const { data, error } = await supabase
        .from('scholarships')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('scholarships')
        .insert(fields)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  });

export const deleteScholarship = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async (ctx) => {
    const { error } = await supabase
      .from('scholarships')
      .delete()
      .eq('id', ctx.data);
    if (error) throw error;
    return { success: true };
  });
