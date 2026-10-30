// Admin reads/writes for the centre pages (/admin/coe, /admin/nss-ncc). Runs in
// the browser with the admin's session so RLS enforces write access (the
// centre's scoped admins or the 'campus_life' section grant — see
// 20261030140000_centre_pages.sql), same pattern as library-admin.ts. The
// browser client revalidates the public site after every write
// (src/app/lib/supabase/client.ts).
import { createClient } from "@/app/lib/supabase/client";

export type CenterListTable = "center_equipment" | "center_programs" | "center_members";
/** Existing tables a centre page pulls rows from by center_id. */
export type CenterLinkTable = "mous" | "events" | "achievements";
type Status = "draft" | "published" | "archived";

export interface CenterRow {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  status: Status;
  album_id: string | null;
  metadata: Record<string, any>;
}

export interface LinkableRow {
  id: string;
  title: string;
  date: string | null;
  status: string;
  center_id: string | null;
}

export interface Option {
  id: string;
  name: string;
}

// RLS turns a denied UPDATE into "0 rows", not an error — select back to detect it.
function assertWritten(rows: unknown[] | null) {
  if (!rows || rows.length === 0) {
    throw new Error("Not saved: you do not have permission to edit this page");
  }
}

export async function getCenter(slug: string): Promise<CenterRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id, name, slug, subtitle, description, status, album_id, metadata")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as CenterRow | null;
}

/**
 * Updates the centre row. `metadataPatch` keys are merged into the row's
 * current metadata (re-read first) so editing one tab never drops keys another
 * tab or the photo editor owns (gallery, highlights, lab…).
 */
export async function updateCenter(
  id: string,
  fields: Partial<Omit<CenterRow, "id" | "slug" | "metadata">>,
  metadataPatch?: Record<string, unknown>,
): Promise<void> {
  const supabase = createClient();
  const payload: Record<string, unknown> = { ...fields, updated_at: new Date().toISOString() };
  if (metadataPatch) {
    const { data: current, error: readError } = await supabase
      .from("centers")
      .select("metadata")
      .eq("id", id)
      .single();
    if (readError) throw readError;
    payload.metadata = {
      ...((current?.metadata as Record<string, unknown>) ?? {}),
      ...metadataPatch,
    };
  }
  const { data, error } = await supabase
    .from("centers")
    .update(payload as any)
    .eq("id", id)
    .select("id");
  if (error) throw error;
  assertWritten(data);
}

export async function listCenterRows<T>(table: CenterListTable, centerId: string): Promise<T[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as T[];
}

export async function upsertCenterRow(
  table: CenterListTable,
  row: Record<string, unknown> & { id?: string },
): Promise<void> {
  const supabase = createClient();
  const { id, ...fields } = row;
  if (id) {
    const { data, error } = await supabase
      .from(table)
      .update({ ...fields, updated_at: new Date().toISOString() } as any)
      .eq("id", id)
      .select("id");
    if (error) throw error;
    assertWritten(data);
    return;
  }
  const { error } = await supabase.from(table).insert(fields as any);
  if (error) throw error;
}

/** Soft delete — the row goes to Admin → Trash & Recovery. */
export async function deleteCenterRow(table: CenterListTable, id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id ?? null } as any)
    .eq("id", id)
    .select("id");
  if (error) throw error;
  assertWritten(data);
}

/** Rewrites sort_order as 1..n in the given order (only rows whose position changed). */
export async function reorderCenterRows(
  table: CenterListTable,
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
      .eq("id", r.id);
    if (error) throw error;
  }
}

const LINK_COLUMNS: Record<CenterLinkTable, { title: string; date: string }> = {
  mous: { title: "partner_organization", date: "signed_date" },
  events: { title: "title", date: "start_date" },
  achievements: { title: "title", date: "date" },
};

/** Every non-deleted row of a linkable table, newest first, with its current centre tag. */
export async function listLinkableRows(table: CenterLinkTable): Promise<LinkableRow[]> {
  const supabase = createClient();
  const cols = LINK_COLUMNS[table];
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${cols.title}, ${cols.date}, status, center_id`)
    .is("deleted_at", null)
    .order(cols.date, { ascending: false })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    title: r[cols.title],
    date: r[cols.date] ?? null,
    status: r.status,
    center_id: r.center_id ?? null,
  }));
}

/** Tags (centerId) or untags (null) one MoU / event / achievement. */
export async function setRowCenter(
  table: CenterLinkTable,
  rowId: string,
  centerId: string | null,
): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(table)
    .update({ center_id: centerId } as any)
    .eq("id", rowId)
    .select("id");
  if (error) throw error;
  assertWritten(data);
}

export async function listStaffOptions(): Promise<Option[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("id, title, first_name, last_name")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("first_name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as any[]).map((s) => ({
    id: s.id,
    name: `${s.title ? s.title + " " : ""}${s.first_name} ${s.last_name}`.trim(),
  }));
}
