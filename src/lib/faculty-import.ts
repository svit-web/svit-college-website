import Papa from 'papaparse';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { UserScope } from '@/hooks/useUserScope';
import { canWriteDepartment } from '@/lib/import-scope';

export const FACULTY_CSV_HEADERS = [
  'first_name',
  'last_name',
  'email',
  'department',
  'designation',
  'phone',
  'employee_code',
  'joining_year',
  'qualification',
  'rank_group',
  'gender',
] as const;

export type FacultyCsvColumn = (typeof FACULTY_CSV_HEADERS)[number];
export type FacultyCsvRow = Record<FacultyCsvColumn, string>;

export interface ImportRowError {
  row: number;
  email?: string;
  message: string;
}

export interface FacultyImportSummary {
  totalRows: number;
  created: number;
  updated: number;
  errors: ImportRowError[];
}

type DepartmentLookup = { id: string; name: string; code: string; college_id: string };
type DesignationLookup = { id: string; title: string };

export function buildFacultyTemplateCsv(sampleDepartmentCode?: string): string {
  const sample: FacultyCsvRow = {
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane.doe@example.edu',
    department: sampleDepartmentCode || 'CSE',
    designation: 'Assistant Professor',
    phone: '9876543210',
    employee_code: 'EMP1234',
    joining_year: '2020',
    qualification: 'M.Tech',
    rank_group: '',
    gender: '',
  };
  return Papa.unparse({
    fields: [...FACULTY_CSV_HEADERS],
    data: [FACULTY_CSV_HEADERS.map((h) => sample[h])],
  });
}

export function parseFacultyCsv(file: File): Promise<{ rows: FacultyCsvRow[]; parseErrors: ImportRowError[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const parseErrors: ImportRowError[] = (results.errors || []).map((e) => ({
          row: (e.row ?? 0) + 1,
          message: e.message,
        }));
        resolve({ rows: (results.data || []) as FacultyCsvRow[], parseErrors });
      },
      error: (err) => reject(err),
    });
  });
}

export async function importFacultyCsv(
  supabase: SupabaseClient<Database>,
  rows: FacultyCsvRow[],
  ctx: {
    adminId: string;
    scope: UserScope;
    departments: DepartmentLookup[];
    designations: DesignationLookup[];
  }
): Promise<FacultyImportSummary> {
  const summary: FacultyImportSummary = { totalRows: rows.length, created: 0, updated: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const raw = rows[i];
    const email = (raw.email || '').trim().toLowerCase();
    const firstName = (raw.first_name || '').trim();
    const lastName = (raw.last_name || '').trim();
    const departmentText = (raw.department || '').trim();
    const designationText = (raw.designation || '').trim();

    if (!firstName || !lastName || !email || !departmentText || !designationText) {
      summary.errors.push({ row: rowNum, email, message: 'Missing required field — first_name, last_name, email, department and designation are all required.' });
      continue;
    }
    if (!email.includes('@')) {
      summary.errors.push({ row: rowNum, email, message: `Invalid email "${email}".` });
      continue;
    }

    const dept = ctx.departments.find((d) => d.code?.toLowerCase() === departmentText.toLowerCase() || d.name?.toLowerCase() === departmentText.toLowerCase());
    if (!dept) {
      summary.errors.push({ row: rowNum, email, message: `Unknown department "${departmentText}".` });
      continue;
    }
    if (!canWriteDepartment(ctx.scope, dept)) {
      summary.errors.push({ row: rowNum, email, message: `Department "${departmentText}" is outside your permitted scope.` });
      continue;
    }

    const designation = ctx.designations.find((d) => d.title?.toLowerCase() === designationText.toLowerCase());
    if (!designation) {
      summary.errors.push({ row: rowNum, email, message: `Unknown designation "${designationText}".` });
      continue;
    }

    let joiningYear: number | null = null;
    if (raw.joining_year?.trim()) {
      const n = Number(raw.joining_year.trim());
      if (!Number.isInteger(n)) {
        summary.errors.push({ row: rowNum, email, message: `Invalid joining_year "${raw.joining_year}".` });
        continue;
      }
      joiningYear = n;
    }

    try {
      const { data: existing, error: findErr } = await supabase.from('staff_profiles').select('id').eq('email', email).is('deleted_at', null).maybeSingle();
      if (findErr) throw findErr;

      const isNewStaff = !existing;
      let staffId: string;

      if (existing) {
        staffId = existing.id;
        const updatePayload: Record<string, unknown> = { first_name: firstName, last_name: lastName, updated_by: ctx.adminId };
        if (raw.phone?.trim()) updatePayload.phone = raw.phone.trim();
        if (raw.employee_code?.trim()) updatePayload.employee_code = raw.employee_code.trim();
        if (joiningYear !== null) updatePayload.joining_year = joiningYear;
        if (raw.qualification?.trim()) updatePayload.qualification = raw.qualification.trim();
        if (raw.rank_group?.trim()) updatePayload.rank_group = raw.rank_group.trim();
        if (raw.gender?.trim()) updatePayload.gender = raw.gender.trim();

        const { error: updateErr } = await supabase.from('staff_profiles').update(updatePayload as any).eq('id', staffId);
        if (updateErr) throw updateErr;
      } else {
        const { data: created, error: insertErr } = await supabase
          .from('staff_profiles')
          .insert({
            first_name: firstName,
            last_name: lastName,
            email,
            phone: raw.phone?.trim() || null,
            employee_code: raw.employee_code?.trim() || null,
            joining_year: joiningYear,
            qualification: raw.qualification?.trim() || null,
            rank_group: raw.rank_group?.trim() || null,
            gender: raw.gender?.trim() || null,
            status: 'published',
            created_by: ctx.adminId,
          })
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        staffId = created.id;
      }

      // Assignment is upserted manually (rather than a single onConflict upsert) so an
      // update never clobbers `is_primary` on a row that already exists.
      const { data: existingAssignment, error: findAssignErr } = await supabase
        .from('staff_department_assignments')
        .select('id')
        .eq('staff_id', staffId)
        .eq('department_id', dept.id)
        .is('deleted_at', null)
        .maybeSingle();
      if (findAssignErr) throw findAssignErr;

      if (existingAssignment) {
        const { error: updateAssignErr } = await supabase
          .from('staff_department_assignments')
          .update({ designation_id: designation.id, updated_by: ctx.adminId })
          .eq('id', existingAssignment.id);
        if (updateAssignErr) throw updateAssignErr;
      } else {
        const { count, error: countErr } = await supabase
          .from('staff_department_assignments')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', staffId)
          .is('deleted_at', null);
        if (countErr) throw countErr;

        const { error: insertAssignErr } = await supabase.from('staff_department_assignments').insert({
          staff_id: staffId,
          department_id: dept.id,
          designation_id: designation.id,
          is_primary: (count || 0) === 0,
          status: 'published',
          created_by: ctx.adminId,
        });
        if (insertAssignErr) throw insertAssignErr;
      }

      if (isNewStaff) summary.created++;
      else summary.updated++;
    } catch (err: any) {
      summary.errors.push({ row: rowNum, email, message: err.message || 'Unknown error' });
    }
  }

  return summary;
}
