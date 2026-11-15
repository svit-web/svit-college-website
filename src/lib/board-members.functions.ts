// Server functions for the Board of Management (trustees) from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

export interface BoardMember {
  id: string;
  college_id: string;
  name: string;
  designation: string;
  photo_url: string | null;
  sort_order: number;
  status: "draft" | "published" | "archived";
}

export type BoardMemberListItem = Pick<BoardMember, "id" | "name" | "designation" | "photo_url">;

/**
 * Fetch all published board members, ordered for display
 */
export async function getAllBoardMembers() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("board_members")
    .select("id, name, designation, photo_url")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return unwrap<BoardMemberListItem[]>(result as any, "board members");
}
