import { publicSupabase } from '@/lib/supabase-public';

export async function getAllDownloads() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('downloads')
    .select('id, title, file_url, file_type, category, metadata')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('category')
    .order('title');
  if (error) throw new Error(error.message);
  return data ?? [];
}
