// Whether a college's own achievements, events and facilities also show on its
// departments' pages. They stay college records: the department pages only read
// them. A college with one department is effectively that department, so this
// is on by default there and off otherwise; the College Pages tab in admin stores
// an override on colleges.metadata only when it differs from that default.

export const COLLEGE_CONTENT_KEY = "show_college_content_on_departments";

export function collegeContentDefault(departmentCount: number) {
  return departmentCount === 1;
}

export function showsCollegeContent(
  metadata: Record<string, unknown> | null | undefined,
  departmentCount: number,
) {
  const override = metadata?.[COLLEGE_CONTENT_KEY];
  return typeof override === "boolean" ? override : collegeContentDefault(departmentCount);
}
