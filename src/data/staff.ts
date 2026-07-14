// Staff registry — normalized entity linked to a department by `departmentId`.
// Sorted/grouped purely by `rankGroup` so an admin can reassign a staff
// member to another department or change their rank without touching the UI.
import raw from "./staff.json";

export type RankGroup = "HOD" | "Faculty" | "Support";

export interface StaffMember {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  rankGroup: RankGroup;
  qualification: string | null;
  experienceYears: number | null;
  gender: string;
  status: string;
  departmentId: string;
  photo: string | null;
  profileUrl?: string;
}

export const staff: StaffMember[] = (raw as StaffMember[]).map((s) => ({
  ...s,
  profileUrl: `/staff/${s.id}`,
}));

const RANK_ORDER: Record<RankGroup, number> = { HOD: 1, Faculty: 2, Support: 3 };

export function getStaffForDepartment(departmentId: string): StaffMember[] {
  return staff
    .filter((s) => s.departmentId === departmentId)
    .sort(
      (a, b) =>
        RANK_ORDER[a.rankGroup] - RANK_ORDER[b.rankGroup] ||
        a.name.localeCompare(b.name),
    );
}

export function getStaffById(id: string): StaffMember | undefined {
  return staff.find((s) => s.id === id);
}

export function initialsOf(name: string): string {
  const parts = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, "").split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
