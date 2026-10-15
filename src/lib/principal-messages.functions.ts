// Principal messages shown on /about/principal-message
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface PrincipalMessage {
  id: string;
  college_id: string | null;
  name: string;
  title: string | null;
  content: string;
  photo_url: string | null;
  sort_order: number;
}

/**
 * Fetch all published principal messages, ordered for display
 */
export async function getAllPrincipalMessages() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("principal_messages")
    .select("id, college_id, name, title, content, photo_url, sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return unwrap<PrincipalMessage[]>(result, "principal messages");
}
