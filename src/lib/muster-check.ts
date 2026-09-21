import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Muster numbers are unique per college. A person's college comes from their department
 * assignments, so this looks for another live staff member holding `musterNumber` who is
 * assigned to a department in any of `collegeIds`. Returns that person's name, or null.
 * Not enforced in the DB (see the add_staff_muster_number migration).
 */
export async function findMusterConflict(
  supabase: SupabaseClient<Database>,
  musterNumber: number,
  collegeIds: string[],
  excludeStaffId?: string,
): Promise<string | null> {
  if (collegeIds.length === 0) return null;
  let query = supabase
    .from("staff_department_assignments")
    .select("staff_id, staff_profiles!inner(first_name, last_name), departments!inner(college_id)")
    .eq("staff_profiles.muster_number", musterNumber)
    .is("staff_profiles.deleted_at", null)
    .in("departments.college_id", collegeIds)
    .is("deleted_at", null)
    .limit(1);
  if (excludeStaffId) query = query.neq("staff_id", excludeStaffId);
  const { data, error } = await query;
  if (error) throw error;
  const sp = (
    data?.[0] as { staff_profiles?: { first_name: string; last_name: string } } | undefined
  )?.staff_profiles;
  return sp ? `${sp.first_name} ${sp.last_name}`.trim() : null;
}

/** Parses a muster number: blank -> null, otherwise a non-negative integer (0 is valid). */
export function parseMusterNumber(value: unknown): number | null | undefined {
  const text = String(value ?? "").trim();
  if (text === "") return null;
  if (!/^\d+$/.test(text)) return undefined;
  return Number(text);
}
