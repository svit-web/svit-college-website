// Server functions for the Board of Management (trustees) from Supabase
import { publicSupabase } from '@/lib/supabase-public';

export interface BoardMember {
  id: string;
  college_id: string;
  name: string;
  designation: string;
  photo_url: string | null;
  sort_order: number;
  status: 'draft' | 'published' | 'archived';
}

/**
 * Fetch all published board members, ordered for display
 */
export async function getAllBoardMembers() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('board_members')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching board members:', error);
    throw error;
  }

  return data as BoardMember[];
}
