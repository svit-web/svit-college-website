import Papa from 'papaparse';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { UserScope } from '@/hooks/useUserScope';
import { canWriteDepartment } from '@/lib/import-scope';
import type { ImportRowError } from '@/lib/faculty-import';

export const ACHIEVEMENT_CSV_HEADERS = ['email', 'type', 'title', 'year', 'description'] as const;
export type AchievementCsvColumn = (typeof ACHIEVEMENT_CSV_HEADERS)[number];
export type AchievementCsvRow = Record<AchievementCsvColumn, string>;

const VALID_ACHIEVEMENT_TYPES = ['award', 'patent', 'publication', 'research', 'qualification', 'experience'] as const;

export interface AchievementImportSummary {
  totalRows: number;
  created: number;
  skipped: number;
  errors: ImportRowError[];
}

type DepartmentLookup = { id: string; college_id: string };

export function buildAchievementsTemplateCsv(): string {
  const sample: AchievementCsvRow = {
    email: 'jane.doe@example.edu',
    type: 'award',
    title: 'Best Paper Award, IEEE Conference 2023',
    year: '2023',
    description: 'Awarded for outstanding research contribution.',
  };
  return Papa.unparse({
    fields: [...ACHIEVEMENT_CSV_HEADERS],
    data: [ACHIEVEMENT_CSV_HEADERS.map((h) => sample[h])],
  });
}

export function parseAchievementsCsv(file: File): Promise<{ rows: AchievementCsvRow[]; parseErrors: ImportRowError[] }> {
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
        resolve({ rows: (results.data || []) as AchievementCsvRow[], parseErrors });
      },
      error: (err) => reject(err),
    });
  });
}

export async function importAchievementsCsv(
  supabase: SupabaseClient<Database>,
  rows: AchievementCsvRow[],
  ctx: { scope: UserScope; departments: DepartmentLookup[] }
): Promise<AchievementImportSummary> {
  const summary: AchievementImportSummary = { totalRows: rows.length, created: 0, skipped: 0, errors: [] };
  const sb = supabase as any; // staff_achievements is not in the generated Database types yet (matches existing AdminStaffWizardsPage usage)

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1;
    const raw = rows[i];
    const email = (raw.email || '').trim().toLowerCase();
    const type = (raw.type || '').trim().toLowerCase();
    const title = (raw.title || '').trim();

    if (!email || !type || !title) {
      summary.errors.push({ row: rowNum, email, message: 'Missing required field — email, type and title are all required.' });
      continue;
    }
    if (!(VALID_ACHIEVEMENT_TYPES as readonly string[]).includes(type)) {
      summary.errors.push({ row: rowNum, email, message: `Invalid type "${type}". Must be one of: ${VALID_ACHIEVEMENT_TYPES.join(', ')}.` });
      continue;
    }

    let year: number | null = null;
    if (raw.year?.trim()) {
      const n = Number(raw.year.trim());
      if (!Number.isInteger(n)) {
        summary.errors.push({ row: rowNum, email, message: `Invalid year "${raw.year}".` });
        continue;
      }
      year = n;
    }

    try {
      const { data: staff, error: staffErr } = await supabase
        .from('staff_profiles')
        .select('id, staff_department_assignments(department_id, deleted_at)')
        .eq('email', email)
        .is('deleted_at', null)
        .maybeSingle();
      if (staffErr) throw staffErr;
      if (!staff) {
        summary.errors.push({ row: rowNum, email, message: 'No faculty member found with this email — import faculty first.' });
        continue;
      }

      const activeDeptIds: string[] = ((staff as any).staff_department_assignments || []).filter((a: any) => !a.deleted_at).map((a: any) => a.department_id);
      const inScope = activeDeptIds.some((deptId) => {
        const dept = ctx.departments.find((d) => d.id === deptId);
        return dept && canWriteDepartment(ctx.scope, dept);
      });
      if (!inScope) {
        summary.errors.push({ row: rowNum, email, message: 'This faculty member is not in your department.' });
        continue;
      }

      let dupQuery = sb.from('staff_achievements').select('id').eq('staff_id', staff.id).eq('type', type).eq('title', title).is('deleted_at', null);
      dupQuery = year === null ? dupQuery.is('year', null) : dupQuery.eq('year', year);
      const { data: dupRows, error: dupErr } = await dupQuery;
      if (dupErr) throw dupErr;
      if (dupRows && dupRows.length > 0) {
        summary.skipped++;
        continue;
      }

      const { error: insertErr } = await sb.from('staff_achievements').insert({
        staff_id: staff.id,
        type,
        title,
        year,
        description: raw.description?.trim() || null,
      });
      if (insertErr) throw insertErr;
      summary.created++;
    } catch (err: any) {
      summary.errors.push({ row: rowNum, email, message: err.message || 'Unknown error' });
    }
  }

  return summary;
}
