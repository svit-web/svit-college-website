// Admin reads/writes for /admin/library. Runs in the browser with the admin's
// session so RLS enforces write access (global admins, or the 'library'
// section grant — see 20261029120000_central_library.sql), same pattern as
// scholarships-next.ts. The browser client revalidates the public site after
// every write (src/app/lib/supabase/client.ts).
import { createClient } from '@/app/lib/supabase/client';
import { LIBRARY_FACILITY_SLUG } from '@/lib/library-paths';

export type LibraryListTable = 'library_resources' | 'library_info_items';
type Status = 'draft' | 'published' | 'archived';

export interface LibraryFacilityRow {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  status: Status;
  department_id: string | null;
  album_id: string | null;
  metadata: Record<string, any>;
}

export interface LibraryResourceRow {
  id?: string;
  name: string;
  category: string;
  publisher: string | null;
  description: string | null;
  website_url: string | null;
  access_note: string | null;
  logo_url: string | null;
  sort_order: number;
  status: Status;
}

export interface LibraryInfoRow {
  id?: string;
  kind: string;
  title: string;
  value: string | null;
  description: string | null;
  sort_order: number;
  status: Status;
}

export interface Option {
  id: string;
  name: string;
}

// RLS turns a denied UPDATE into "0 rows", not an error — select back to detect it.
function assertWritten(rows: unknown[] | null) {
  if (!rows || rows.length === 0) {
    throw new Error('Not saved: you do not have permission to edit the Central Library');
  }
}

export async function getLibraryFacility(): Promise<LibraryFacilityRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, subtitle, description, status, department_id, album_id, metadata')
    .eq('slug', LIBRARY_FACILITY_SLUG)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as LibraryFacilityRow | null;
}

/**
 * Updates the library facility row. `metadataPatch` keys are merged into the
 * row's current metadata (re-read first) so editing one tab never drops keys
 * another tab or the photo editor owns (gallery, highlights…).
 */
export async function updateLibraryFacility(
  id: string,
  fields: Partial<Omit<LibraryFacilityRow, 'id' | 'metadata'>>,
  metadataPatch?: Record<string, unknown>,
): Promise<void> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  if (metadataPatch) {
    const { data: current, error: readError } = await supabase
      .from('facilities')
      .select('metadata')
      .eq('id', id)
      .single();
    if (readError) throw readError;
    payload.metadata = {
      ...((current?.metadata as Record<string, unknown>) ?? {}),
      ...metadataPatch,
    };
  }
  const { data, error } = await supabase
    .from('facilities')
    .update(payload as any)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  assertWritten(data);
}

export async function listLibraryRows<T>(table: LibraryListTable): Promise<T[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as T[];
}

export async function upsertLibraryRow(
  table: LibraryListTable,
  row: LibraryResourceRow | LibraryInfoRow,
): Promise<void> {
  const supabase = createClient();
  const { id, ...fields } = row;
  if (id) {
    const { data, error } = await supabase
      .from(table)
      .update({ ...fields, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select('id');
    if (error) throw error;
    assertWritten(data);
    return;
  }
  const { error } = await supabase.from(table).insert(fields as any);
  if (error) throw error;
}

/** Soft delete — the row goes to Admin → Trash & Recovery. */
export async function deleteLibraryRow(table: LibraryListTable, id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null } as any)
    .eq('id', id)
    .select('id');
  if (error) throw error;
  assertWritten(data);
}

/** Rewrites sort_order as 1..n in the given order (only rows whose position changed). */
export async function reorderLibraryRows(
  table: LibraryListTable,
  ordered: { id: string; sort_order: number }[],
): Promise<void> {
  const supabase = createClient();
  const changed = ordered
    .map((r, i) => ({ id: r.id, sort_order: i + 1, before: r.sort_order }))
    .filter((r) => r.sort_order !== r.before);
  for (const r of changed) {
    const { error } = await supabase
      .from(table)
      .update({ sort_order: r.sort_order } as any)
      .eq('id', r.id);
    if (error) throw error;
  }
}

export async function listColleges(): Promise<Option[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('colleges')
    .select('id, name')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Option[];
}

export async function listDepartments(): Promise<(Option & { code: string | null })[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, code')
    .is('deleted_at', null)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as (Option & { code: string | null })[];
}
