import { publicSupabase } from '@/lib/supabase-public';

export interface MOU {
  id: string;
  partner_organization: string;
  purpose: string | null;
  signed_date: string | null;
  expiry_date: string | null;
  status: string;
  department_name: string | null;
  location: string | null;
  activities: string[] | null;
  metadata: Record<string, any>;
}

export async function getAllMOUs() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('mous')
    .select('*')
    .eq('status', 'published')
    .order('signed_date', { ascending: false });

  if (error) throw error;
  return data as unknown as MOU[];
}
