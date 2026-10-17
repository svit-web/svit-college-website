// Server functions for committees data from Supabase
import { publicSupabase, unwrap } from "@/lib/supabase-public";

// Members live in the committee_members child table (formerly
// committees.metadata.members). A Linked member (staff_profile_id set) is
// rendered from the live staff profile — name, designation, contact, photo —
// so edits to the profile show here automatically; the row's own text is the
// fallback for External members and for links to unpublished/deleted staff.
// `position` (Chairman, Member…) is committee-specific and always comes from
// the row.
interface LinkedStaff {
  title: string | null;
  first_name: string;
  last_name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  employee_code: string | null;
  status: string;
  deleted_at: string | null;
}

export interface CommitteeMember {
  id: string;
  name: string;
  position?: string | null;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  staff_profile_id?: string | null;
  sort_order?: number;
  photo_url?: string | null;
  // Set only for Linked members whose staff profile is live.
  profile_href?: string | null;
  staff?: LinkedStaff | null;
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
        id, name, position, designation, email, phone, staff_profile_id, sort_order,
        staff:staff_profile_id (
          title, first_name, last_name, designation, email, phone, photo_url,
          employee_code, status, deleted_at
        )
      )`;

function resolveMember(m: CommitteeMember): CommitteeMember {
  const s = m.staff;
  if (!s || s.status !== "published" || s.deleted_at) return { ...m, staff: undefined };
  return {
    ...m,
    name: [s.title, s.first_name, s.last_name].filter(Boolean).join(" "),
    designation: s.designation ?? m.designation,
    email: s.email ?? m.email,
    phone: s.phone ?? m.phone,
    photo_url: s.photo_url,
    profile_href: s.employee_code ? `/staff/${encodeURIComponent(s.employee_code)}` : null,
    staff: undefined,
  };
}

// This project's PostgREST build rejects `order=committee_members(col.asc)`
// (embedded ordering), so members are sorted here instead.
function withSortedMembers<T extends { committee_members?: CommitteeMember[] }>(c: T): T {
  c.committee_members = [...(c.committee_members ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(resolveMember);
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
