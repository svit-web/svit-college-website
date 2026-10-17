// Server functions for the CMS-managed header/utility navigation
// (menus + menu_items tables). menu_type is a fixed, DB-constrained set
// (simple | colleges_mega | campus_mega | placement_mega | links_mega) —
// any value outside that set is still returned as-is and callers should
// treat an unrecognised menu_type as "simple" so a bad admin edit can never
// blank out the navbar.
import { publicSupabase } from "@/lib/supabase-public";

export interface MenuLink {
  id: string;
  title: string;
  url: string | null;
  metadata: Record<string, unknown>;
}

export interface MenuTopItem extends MenuLink {
  menu_type: string;
  children: MenuLink[];
}

interface MenuItemRow {
  id: string;
  parent_id: string | null;
  title: string;
  url: string | null;
  menu_type: string | null;
  sort_order: number;
  metadata: Record<string, unknown> | null;
}

async function getMenuByCode(code: string): Promise<MenuTopItem[]> {
  const supabase = publicSupabase();

  const { data: menu, error: menuError } = await supabase
    .from("menus")
    .select("id")
    .eq("code", code)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (menuError) throw new Error(menuError.message);
  if (!menu) return [];

  const { data, error } = await supabase
    .from("menu_items")
    .select("id, parent_id, title, url, menu_type, sort_order, metadata")
    .eq("menu_id", menu.id)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as MenuItemRow[];
  const childrenByParent = new Map<string, MenuItemRow[]>();
  for (const row of rows) {
    if (!row.parent_id) continue;
    const list = childrenByParent.get(row.parent_id) ?? [];
    list.push(row);
    childrenByParent.set(row.parent_id, list);
  }

  return rows
    .filter((row) => !row.parent_id)
    .map((row) => ({
      id: row.id,
      title: row.title,
      url: row.url,
      menu_type: row.menu_type ?? "simple",
      metadata: row.metadata ?? {},
      children: (childrenByParent.get(row.id) ?? []).map((child) => ({
        id: child.id,
        title: child.title,
        url: child.url,
        metadata: child.metadata ?? {},
      })),
    }));
}

export function getMainNavigation(): Promise<MenuTopItem[]> {
  return getMenuByCode("main_navigation");
}

export function getTopUtilityNavigation(): Promise<MenuTopItem[]> {
  return getMenuByCode("top_navigation");
}

/** Groups a flat child list into columns by their metadata.group, preserving first-seen group order. */
export function groupMenuChildren(
  children: MenuLink[],
): { group: string | null; items: MenuLink[] }[] {
  const order: string[] = [];
  const byGroup = new Map<string, MenuLink[]>();
  for (const child of children) {
    const group = (child.metadata?.group as string | undefined) ?? "";
    if (!byGroup.has(group)) {
      byGroup.set(group, []);
      order.push(group);
    }
    byGroup.get(group)!.push(child);
  }
  return order.map((group) => ({ group: group || null, items: byGroup.get(group)! }));
}
