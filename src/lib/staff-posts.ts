// Designation categories and staff posts (HOD, Principal, Dean…), shared by the
// admin faculty wizard, the faculty CSV import and the public staff queries.
// A post is held on a department assignment (staff_department_assignments.post_ids);
// posts flagged is_department_head make the holder that department's head.
import type { Database } from "@/integrations/supabase/types";

export type DesignationCategory = Database["public"]["Enums"]["designation_category"];

// Categories offered in the faculty designation picker, in display order.
// Support titles stay in the DB for existing records but aren't offered.
export const PICKER_DESIGNATION_CATEGORIES: { value: DesignationCategory; label: string }[] = [
  { value: "teaching", label: "Teaching" },
  { value: "technical", label: "Technical / Lab" },
  { value: "administrative", label: "Administrative & Library" },
];

export type StaffPost = {
  id: string;
  title: string;
  is_department_head: boolean;
  sort_order: number;
};

export const STAFF_POST_COLUMNS = "id, title, is_department_head, sort_order";

/** Posts for an assignment, in the admin-defined order. Unknown/deleted ids are dropped. */
export function postsForIds(postIds: string[] | null | undefined, posts: StaffPost[]): StaffPost[] {
  if (!postIds?.length) return [];
  const held = new Set(postIds);
  return posts.filter((p) => held.has(p.id)).sort((a, b) => a.sort_order - b.sort_order);
}

export function holdsDepartmentHeadPost(
  postIds: string[] | null | undefined,
  posts: StaffPost[],
): boolean {
  return postsForIds(postIds, posts).some((p) => p.is_department_head);
}

/** "Associate Professor · HOD, Dean (R&D)" */
export function formatDesignationWithPosts(designation: string, heldPosts: StaffPost[]): string {
  const postText = heldPosts.map((p) => p.title).join(", ");
  if (!postText) return designation;
  return designation ? `${designation} · ${postText}` : postText;
}
