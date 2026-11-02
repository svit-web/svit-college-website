import { publicSupabase } from '@/lib/supabase-public';

export interface MOU {
  id: string;
  partner_organization: string;
  logo_url: string | null;
  purpose: string | null;
  signed_date: string | null;
  expiry_date: string | null;
  status: string;
  department_id: string | null;
  department: { name: string; code: string } | null;
  // Free text from before department_id existed.
  department_name: string | null;
  location: string | null;
  activities: string[] | null;
  metadata: Record<string, any>;
}

/**
 * PostgREST `or` filter for MoUs the public may see: no expiry date, or one that
 * hasn't passed (a MoU is valid through its expiry day, in India time). Applied
 * when reading rather than by flipping status, so a MoU drops off the site as
 * soon as it expires, needs no scheduled job, and comes back if the admin
 * extends the date. Admin screens don't use it, so they still list expired MoUs.
 */
export function notExpiredFilter() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return `expiry_date.is.null,expiry_date.gte.${today}`;
}

function publishedMOUs(select: string) {
  return publicSupabase()
    .from('mous')
    .select(select)
    .eq('status', 'published')
    .is('deleted_at', null)
    .or(notExpiredFilter())
    .order('signed_date', { ascending: false });
}

export async function getAllMOUs() {
  const { data, error } = await publishedMOUs('*, department:departments(name, code)');
  if (!error) return data as unknown as MOU[];

  // The departments join needs migration 20261102120000. Without this, a
  // deploy that lands before it would empty every MoU list on the site.
  const plain = await publishedMOUs('*');
  if (plain.error) throw plain.error;
  return plain.data as unknown as MOU[];
}

export async function getDepartmentMOUs(departmentId: string) {
  const { data, error } = await publishedMOUs('*').eq('department_id', departmentId);
  if (error) throw error;
  return data as unknown as MOU[];
}

/** Decides whether the department shows its MoUs tab. */
export async function hasDepartmentMOUs(departmentId: string) {
  const { count, error } = await publicSupabase()
    .from('mous')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', departmentId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .or(notExpiredFilter());
  if (error) throw error;
  return (count ?? 0) > 0;
}
