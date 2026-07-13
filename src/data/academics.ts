// Normalized academic hierarchy for the SVIT Group.
// Shape mirrors a future API response: entities reference their parent by ID
// so a program/department can be moved to a different parent by editing one
// field — no UI changes required.
//
// Levels: Trust → College → (DegreeType?) → Department → Program
// SVION, COA, and SVICA skip the DegreeType level (departments attach
// directly to the college via `degreeTypeId: null`).

import type { CollegeSlug } from "./colleges";

export type DegreeLevel = "UG" | "PG" | "Diploma";

export interface Trust {
  id: string;
  name: string;
}

export interface CollegeRef {
  id: CollegeSlug;
  trustId: string;
}

export interface DegreeType {
  id: string;
  name: string;
  level: DegreeLevel;
  collegeId: CollegeSlug;
}

export interface Department {
  id: string;
  name: string;
  collegeId: CollegeSlug;
  degreeTypeId: string | null; // null → college has no degree-type grouping
  // TODO: drop real department icon file here when available.
  icon: string | null;
}

export interface Program {
  id: string;
  name: string;
  departmentId: string;
  // TODO: drop real program icon file here when available.
  icon: string | null;
}

export const trust: Trust = { id: "svit-group", name: "SVIT Group" };

export const collegeRefs: CollegeRef[] = [
  { id: "svit", trustId: "svit-group" },
  { id: "svion", trustId: "svit-group" },
  { id: "svit-coa", trustId: "svit-group" },
  { id: "svica", trustId: "svit-group" },
];

export const degreeTypes: DegreeType[] = [
  { id: "svit-be", name: "BE", level: "UG", collegeId: "svit" },
  { id: "svit-me", name: "ME", level: "PG", collegeId: "svit" },
  { id: "svit-diploma", name: "Diploma", level: "Diploma", collegeId: "svit" },
  { id: "svit-mba", name: "MBA", level: "PG", collegeId: "svit" },
  { id: "svit-mca", name: "MCA", level: "PG", collegeId: "svit" },
];

export const departments: Department[] = [
  // SVIT · BE
  { id: "dept-svit-be-aeronautical", name: "Aeronautical Engineering", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-mechanical", name: "Mechanical Engineering", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-electrical", name: "Electrical Engineering", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-civil", name: "Civil Engineering", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-computer", name: "Computer Engineering", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-csd", name: "Computer Science & Design", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-it", name: "Information Technology", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  { id: "dept-svit-be-ec", name: "Electronics & Communication", collegeId: "svit", degreeTypeId: "svit-be", icon: null },
  // SVIT · ME
  { id: "dept-svit-me-computer", name: "Computer Engineering", collegeId: "svit", degreeTypeId: "svit-me", icon: null },
  { id: "dept-svit-me-civil", name: "Civil Engineering", collegeId: "svit", degreeTypeId: "svit-me", icon: null },
  // SVIT · Diploma
  { id: "dept-svit-dip-computer", name: "Computer Engineering", collegeId: "svit", degreeTypeId: "svit-diploma", icon: null },
  { id: "dept-svit-dip-it", name: "Information Technology", collegeId: "svit", degreeTypeId: "svit-diploma", icon: null },
  { id: "dept-svit-dip-electrical", name: "Electrical Engineering", collegeId: "svit", degreeTypeId: "svit-diploma", icon: null },
  { id: "dept-svit-dip-mechanical", name: "Mechanical Engineering", collegeId: "svit", degreeTypeId: "svit-diploma", icon: null },
  { id: "dept-svit-dip-civil", name: "Civil Engineering", collegeId: "svit", degreeTypeId: "svit-diploma", icon: null },
  // SVIT · MBA
  { id: "dept-svit-mba", name: "Management Studies", collegeId: "svit", degreeTypeId: "svit-mba", icon: null },
  // SVIT · MCA
  { id: "dept-svit-mca", name: "Computer Applications (PG)", collegeId: "svit", degreeTypeId: "svit-mca", icon: null },
  // SVION — no degree-type grouping
  { id: "dept-svion-gn", name: "General Nursing", collegeId: "svion", degreeTypeId: null, icon: null },
  // COA — no degree-type grouping
  { id: "dept-coa-arch", name: "Architecture & Design", collegeId: "svit-coa", degreeTypeId: null, icon: null },
  // SVICA — no degree-type grouping
  { id: "dept-svica-ca", name: "Computer Applications", collegeId: "svica", degreeTypeId: null, icon: null },
];

export const programs: Program[] = [
  // SVIT · BE
  { id: "prog-svit-be-aeronautical", name: "Bachelor of Engineering in Aeronautical Engineering", departmentId: "dept-svit-be-aeronautical", icon: null },
  { id: "prog-svit-be-mechanical", name: "Bachelor of Engineering in Mechanical Engineering", departmentId: "dept-svit-be-mechanical", icon: null },
  { id: "prog-svit-be-electrical", name: "Bachelor of Engineering in Electrical Engineering", departmentId: "dept-svit-be-electrical", icon: null },
  { id: "prog-svit-be-civil", name: "Bachelor of Engineering in Civil Engineering", departmentId: "dept-svit-be-civil", icon: null },
  { id: "prog-svit-be-computer", name: "Bachelor of Engineering in Computer Engineering", departmentId: "dept-svit-be-computer", icon: null },
  { id: "prog-svit-be-csd", name: "Bachelor of Engineering in Computer Science & Design Engineering", departmentId: "dept-svit-be-csd", icon: null },
  { id: "prog-svit-be-it", name: "Bachelor of Engineering in Information Technology Engineering", departmentId: "dept-svit-be-it", icon: null },
  { id: "prog-svit-be-ec", name: "Bachelor of Engineering in Electronics & Communication Engineering", departmentId: "dept-svit-be-ec", icon: null },
  // SVIT · ME
  { id: "prog-svit-me-software", name: "Master of Engineering in Software", departmentId: "dept-svit-me-computer", icon: null },
  { id: "prog-svit-me-structure", name: "Master of Engineering in Structure", departmentId: "dept-svit-me-civil", icon: null },
  // SVIT · Diploma
  { id: "prog-svit-dip-computer", name: "Diploma in Computer Engineering", departmentId: "dept-svit-dip-computer", icon: null },
  { id: "prog-svit-dip-it", name: "Diploma in Information Technology Engineering", departmentId: "dept-svit-dip-it", icon: null },
  { id: "prog-svit-dip-electrical", name: "Diploma in Electrical Engineering", departmentId: "dept-svit-dip-electrical", icon: null },
  { id: "prog-svit-dip-mechanical", name: "Diploma in Mechanical Engineering", departmentId: "dept-svit-dip-mechanical", icon: null },
  { id: "prog-svit-dip-civil", name: "Diploma in Civil Engineering", departmentId: "dept-svit-dip-civil", icon: null },
  // SVIT · MBA
  { id: "prog-svit-mba", name: "Master in Business Administration", departmentId: "dept-svit-mba", icon: null },
  // SVIT · MCA
  { id: "prog-svit-mca", name: "Master of Computer Applications", departmentId: "dept-svit-mca", icon: null },
  // SVION
  { id: "prog-svion-gnm", name: "General Nursing & Midwifery", departmentId: "dept-svion-gn", icon: null },
  // COA
  { id: "prog-coa-barch", name: "Bachelor of Architecture", departmentId: "dept-coa-arch", icon: null },
  { id: "prog-coa-bid", name: "Bachelor of Interior Design", departmentId: "dept-coa-arch", icon: null },
  { id: "prog-coa-diparch", name: "Diploma in Architecture", departmentId: "dept-coa-arch", icon: null },
  // SVICA
  { id: "prog-svica-bca", name: "Bachelor in Computer Applications (BCA)", departmentId: "dept-svica-ca", icon: null },
  { id: "prog-svica-bsc-it", name: "Bachelor in Science, IT", departmentId: "dept-svica-ca", icon: null },
];

// ---- Selectors (treat like API queries) ----

export function getDepartmentsForCollege(collegeId: CollegeSlug): Department[] {
  return departments.filter((d) => d.collegeId === collegeId);
}

export function getDegreeTypesForCollege(collegeId: CollegeSlug): DegreeType[] {
  return degreeTypes.filter((d) => d.collegeId === collegeId);
}

export function getProgramsForDepartment(departmentId: string): Program[] {
  return programs.filter((p) => p.departmentId === departmentId);
}

/**
 * Shape used by the shared landing template:
 *  - SVIT → one group per degree type, each listing its dept programs.
 *  - Other colleges → one group per department.
 */
export interface CollegeProgramView {
  group: string;
  items: {
    departmentId: string;
    departmentName: string;
    programs: Program[];
  }[];
}

export function getCollegeProgramView(collegeId: CollegeSlug): CollegeProgramView[] {
  const depts = getDepartmentsForCollege(collegeId);
  const collegeDegreeTypes = getDegreeTypesForCollege(collegeId);

  if (collegeDegreeTypes.length === 0) {
    // Flat: department is the group label.
    return depts.map((d) => ({
      group: d.name,
      items: [
        {
          departmentId: d.id,
          departmentName: d.name,
          programs: getProgramsForDepartment(d.id),
        },
      ],
    }));
  }

  return collegeDegreeTypes.map((dt) => ({
    group: dt.name,
    items: depts
      .filter((d) => d.degreeTypeId === dt.id)
      .map((d) => ({
        departmentId: d.id,
        departmentName: d.name,
        programs: getProgramsForDepartment(d.id),
      })),
  }));
}
