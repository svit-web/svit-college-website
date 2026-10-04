// Server functions for committees data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

// Members live in the committee_members child table (formerly
// committees.metadata.members); staff_profile_id is set when the member was
// auto-linked to a staff profile by email — External members carry only the
// free-text fields.
export interface CommitteeMember {
  id: string;
  name: string;
  position?: string;
  designation?: string;
  email?: string;
  phone?: string;
  staff_profile_id?: string | null;
  sort_order?: number;
}

export interface Committee {
  id: string;
  college_id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  metadata: {
    description?: string;
    vision?: string;
    mission?: string;
    keyActivities?: string[];
  };
  committee_members?: CommitteeMember[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published committees for a specific college
 */
const COMMITTEE_SELECT = `*,
      committee_members (
        id, name, position, designation, email, phone, staff_profile_id, sort_order
      )`;

// This project's PostgREST build rejects `order=committee_members(col.asc)`
// (embedded ordering), so members are sorted here instead.
function withSortedMembers<T extends { committee_members?: CommitteeMember[] }>(c: T): T {
  c.committee_members = [...(c.committee_members ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  return c;
}

export async function getCommitteesByCollege(collegeId: string) {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select(COMMITTEE_SELECT)
    .eq("college_id", collegeId)
    .eq("status", "published")
    .is("deleted_at", null)
    .eq("committee_members.status", "published")
    .is("committee_members.deleted_at", null)
    .order("name", { ascending: true });

  const committees = unwrap<Committee[]>(result as any, "committees");
  return committees.map(withSortedMembers);
}

/**
 * Fetch all published committees (for SVIT Group-wide committees)
 */
export async function getAllCommittees() {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select(COMMITTEE_SELECT)
    .eq("status", "published")
    .is("deleted_at", null)
    .eq("committee_members.status", "published")
    .is("committee_members.deleted_at", null)
    .order("name", { ascending: true });

  const committees = unwrap<Committee[]>(result as any, "committees");
  return committees.map(withSortedMembers);
}

/**
 * Fetch a single committee by slug
 */
export async function getCommitteeBySlug(slug: string) {
  const supabase = publicSupabase();
  const result = await supabase
    .from("committees")
    .select(COMMITTEE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .eq("committee_members.status", "published")
    .is("committee_members.deleted_at", null)
    .single();

  return withSortedMembers(unwrap<Committee>(result as any, "committee"));
}
