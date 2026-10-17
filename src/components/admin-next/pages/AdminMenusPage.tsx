'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Menu, Plus, Trash2, Edit2, Folder, ChevronDown, ChevronRight, Loader2, Link as LinkIcon, CornerDownRight, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUser } from '@/app/lib/auth/admin';
import { MENU_TYPE_OPTIONS } from '@/lib/admin-option-sets';

interface MenuItemNode {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  link_type: string;
  menu_type: string | null;
  url: string | null;
  page_id: string | null;
  icon: string | null;
  sort_order: number;
  status: string;
  children?: MenuItemNode[];
}

export function AdminMenusPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []);
  const userId = admin.id;

  const [menusList, setMenusList] = useState<any[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [loadingMenus, setLoadingMenus] = useState(true);

  const [menuItems, setMenuItems] = useState<MenuItemNode[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [newMenuValues, setNewMenuValues] = useState({ name: '', code: 'main' });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemNode | null>(null);
  const [itemFormValues, setItemFormValues] = useState({
    title: '',
    url: '',
    link_type: 'external',
    // How the Header renders this item (plain link vs one of the mega
    // panels) — the DB-constrained set, offered as a dropdown.
    menu_type: 'simple',
    sort_order: 0,
    parent_id: '' as string | null,
    // Labeled metadata fields (the only two menu_items.metadata keys the site
    // reads): `group` is the mega-panel column a sub-link sorts into,
    // `quote` is the italic text shown in the About mega panel.
    group: '',
    quote: '',
    metadata: {} as Record<string, any>,
  });

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMenuId) {
      loadMenuItems(selectedMenuId);
    } else {
      setMenuItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuId]);

  async function loadMenus() {
    setLoadingMenus(true);
    try {
      const { data, error } = await supabase.from('menus').select('*').is('deleted_at', null).order('name', { ascending: true });

      if (error) throw error;
      setMenusList(data || []);
      if (data && data.length > 0) {
        setSelectedMenuId((prev) => prev || data[0].id);
      }
    } catch (err: any) {
      toast.error(`Failed to load menus list: ${err.message}`);
    } finally {
      setLoadingMenus(false);
    }
  }

  async function loadMenuItems(menuId: string) {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase.from('menu_items').select('*').eq('menu_id', menuId).is('deleted_at', null).order('sort_order', { ascending: true });

      if (error) throw error;
      setMenuItems(buildMenuTree(data || []));
    } catch (err: any) {
      toast.error(`Failed to load menu tree: ${err.message}`);
    } finally {
      setLoadingItems(false);
    }
  }

  function buildMenuTree(flatItems: any[]): MenuItemNode[] {
    const itemMap: Record<string, MenuItemNode> = {};
    const roots: MenuItemNode[] = [];

    flatItems.forEach((item) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    flatItems.forEach((item) => {
      const node = itemMap[item.id];
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children?.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (nodes: MenuItemNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach((n) => {
        if (n.children) sortNodes(n.children);
      });
    };
    sortNodes(roots);

    return roots;
  }

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('menus')
        .insert({ name: newMenuValues.name, code: newMenuValues.code, status: 'published' })
        .select()
        .single();

      if (error) throw error;
      toast.success('Menu created!');
      setIsMenuModalOpen(false);
      setNewMenuValues({ name: '', code: 'main' });
      loadMenus();
      if (data) setSelectedMenuId(data.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuId) return;

    try {
      // Keep any other metadata keys untouched; only group/quote are managed
      // by this form. Empty string removes the key.
      const nextMetadata: Record<string, any> = { ...(itemFormValues.metadata ?? {}) };
      if (itemFormValues.group.trim()) nextMetadata.group = itemFormValues.group.trim();
      else delete nextMetadata.group;
      if (itemFormValues.quote.trim()) nextMetadata.quote = itemFormValues.quote.trim();
      else delete nextMetadata.quote;

      const payload: Record<string, any> = {
        menu_id: selectedMenuId,
        title: itemFormValues.title,
        link_type: itemFormValues.link_type,
        menu_type: itemFormValues.menu_type,
        url: itemFormValues.url || null,
        sort_order: Number(itemFormValues.sort_order),
        parent_id: itemFormValues.parent_id || null,
        status: 'published',
        metadata: nextMetadata,
      };

      if (editingItem) {
        const { error } = await supabase.from('menu_items').update(payload as any).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Menu item updated!');
      } else {
        const { error } = await supabase.from('menu_items').insert(payload as any);
        if (error) throw error;
        toast.success('Menu item added to tree!');
      }

      setIsItemModalOpen(false);
      setEditingItem(null);
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpenAddItem = (parentId: string | null = null) => {
    setEditingItem(null);
    setItemFormValues({
      title: '',
      url: '',
      link_type: 'external',
      menu_type: 'simple',
      sort_order: menuItems.length * 10,
      parent_id: parentId,
      group: '',
      quote: '',
      metadata: {},
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: MenuItemNode) => {
    setEditingItem(item);
    const meta = (item as any).metadata ?? {};
    setItemFormValues({
      title: item.title,
      url: item.url || '',
      link_type: item.link_type,
      menu_type: item.menu_type || 'simple',
      sort_order: item.sort_order,
      parent_id: item.parent_id,
      group: typeof meta.group === 'string' ? meta.group : '',
      quote: typeof meta.quote === 'string' ? meta.quote : '',
      metadata: meta,
    });
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = async (node: MenuItemNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const msg = hasChildren
      ? 'Warning: This menu item has sub-links underneath it. Deleting it will soft-delete all nested sub-links as well. Continue?'
      : 'Are you sure you want to remove this navigation link?';

    const confirmed = window.confirm(msg);
    if (!confirmed) return;

    const now = new Date().toISOString();
    const softDeletePayload = { deleted_at: now, deleted_by: userId };

    const collectIds = (nodes: MenuItemNode[]): string[] => nodes.flatMap((n) => [n.id, ...(n.children ? collectIds(n.children) : [])]);

    const descendantIds = hasChildren && node.children ? collectIds(node.children) : [];

    try {
      const { error: parentErr } = await supabase.from('menu_items').update(softDeletePayload).eq('id', node.id);
      if (parentErr) throw parentErr;

      if (descendantIds.length > 0) {
        const { error: childErr } = await supabase.from('menu_items').update(softDeletePayload).in('id', descendantIds);
        if (childErr) throw childErr;
      }

      toast.success('Menu item removed successfully.');
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleShiftSort = async (item: MenuItemNode, direction: 'up' | 'down') => {
    let siblings: MenuItemNode[] = [];
    if (item.parent_id) {
      const findSiblings = (nodes: MenuItemNode[]): MenuItemNode[] => {
        for (const n of nodes) {
          if (n.id === item.parent_id) return n.children || [];
          if (n.children) {
            const res = findSiblings(n.children);
            if (res.length > 0) return res;
          }
        }
        return [];
      };
      siblings = findSiblings(menuItems);
    } else {
      siblings = menuItems;
    }

    const idx = siblings.findIndex((s) => s.id === item.id);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= siblings.length) return;

    const targetItem = siblings[targetIdx];

    try {
      const [r1, r2] = await Promise.all([
        supabase.from('menu_items').update({ sort_order: targetItem.sort_order }).eq('id', item.id),
        supabase.from('menu_items').update({ sort_order: item.sort_order }).eq('id', targetItem.id),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;

      toast.success('Order rearranged.');
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTreeNode = (node: MenuItemNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1.5">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition" style={{ marginLeft: `${depth * 24}px` }}>
          <div className="flex items-center gap-3 min-w-0">
            {depth > 0 && <CornerDownRight className="h-4 w-4 text-slate-700 shrink-0" />}

            {hasChildren ? (
              <button onClick={() => toggleExpand(node.id)} className="text-slate-500 hover:text-navy shrink-0">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-4 h-4 shrink-0" />
            )}

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white text-crimson border border-slate-200">
              <Folder className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1.5">
                {node.title}
                {node.menu_type && node.menu_type !== 'simple' && (
                  <span className="rounded-full bg-crimson/10 px-1.5 py-0.5 text-[9px] font-bold text-crimson border border-crimson/15 shrink-0">
                    {MENU_TYPE_OPTIONS.find((t) => t.value === node.menu_type)?.label ?? node.menu_type}
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                <LinkIcon className="h-2.5 w-2.5" />
                <span>{node.url || '(No Link)'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handleShiftSort(node, 'up')} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy transition" title="Move up">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => handleShiftSort(node, 'down')} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy transition" title="Move down">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-100 mx-1" />

            <button
              onClick={() => handleOpenAddItem(node.id)}
              className="flex items-center gap-1 rounded bg-crimson/10 px-2 py-1 text-[10px] font-bold text-crimson border border-crimson/15 hover:bg-crimson/20 transition"
              title="Add child sub-link"
            >
              <Plus className="h-3 w-3" />
              <span>Add Child</span>
            </button>

            <button onClick={() => handleOpenEditItem(node)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-navy transition" title="Edit Link">
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            <button onClick={() => handleDeleteItem(node)} className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-450 transition" title="Remove Link">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && <div className="space-y-1.5">{node.children?.map((child) => renderTreeNode(child, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">Navigation Menu Tree Manager</h1>
          <p className="text-sm text-slate-500">Build and arrange nested multi-level website menus and headers.</p>
        </div>

        <button onClick={() => setIsMenuModalOpen(true)} className="flex items-center gap-2 rounded bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 shadow transition">
          <Plus className="h-4 w-4" />
          <span>New Menu Group</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 border border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Navigation Group</span>
          {loadingMenus ? (
            <Loader2 className="h-5 w-5 animate-spin text-crimson" />
          ) : (
            <select value={selectedMenuId} onChange={(e) => setSelectedMenuId(e.target.value)} className="rounded font-mono px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none">
              {menusList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => handleOpenAddItem()}
          disabled={!selectedMenuId}
          className="flex items-center gap-2 rounded bg-crimson/10 px-4 py-2 text-sm font-semibold text-crimson border border-crimson/20 hover:bg-crimson/15 disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Root Link</span>
        </button>
      </div>

      <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-xl min-h-[400px]">
        {loadingItems ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-crimson" />
          </div>
        ) : menuItems.length > 0 ? (
          <div className="space-y-3">{menuItems.map((rootNode) => renderTreeNode(rootNode))}</div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Menu className="h-14 w-14 text-slate-800" />
            <h3 className="mt-4 text-base font-bold text-navy">Menu is Empty</h3>
            <p className="mt-2 max-w-sm text-xs text-slate-500">There are no links in this menu. Click the &quot;Add Root Link&quot; button above to register your first navigation link.</p>
          </div>
        )}
      </div>

      {isMenuModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-navy mb-4">Create Navigation Menu</h3>

            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Menu Name (e.g. Header Navigation)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Header Menu"
                  value={newMenuValues.name}
                  onChange={(e) => setNewMenuValues((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">System Code (slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. main-header"
                  value={newMenuValues.code}
                  onChange={(e) => setNewMenuValues((p) => ({ ...p, code: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsMenuModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">
                  Create Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-navy mb-4">{editingItem ? 'Edit Navigation Link' : 'Add Navigation Link'}</h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Link Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admissions"
                  value={itemFormValues.title}
                  onChange={(e) => setItemFormValues((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Link Type</label>
                  <select
                    value={itemFormValues.link_type}
                    onChange={(e) => setItemFormValues((p) => ({ ...p, link_type: e.target.value }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  >
                    {/* The menu_items.link_type enum is internal/external, not
                        custom/page. "internal" would need a page_id picker and
                        the public nav has no code to resolve a page_id into a
                        link, so only "external" (a URL, which covers every
                        live row today, including site-relative paths like
                        /admissions) is offered until that's built. */}
                    <option value="external">Link (URL or site path)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={itemFormValues.sort_order}
                    onChange={(e) => setItemFormValues((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Header Display</label>
                <select
                  value={itemFormValues.menu_type}
                  onChange={(e) => setItemFormValues((p) => ({ ...p, menu_type: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                >
                  {MENU_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  How the site Header renders this item. Mega panels are the wide dropdowns — the item then stands for the panel and its sub-links fill it.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Target URL / Route Link</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /admissions or https://external.com"
                  value={itemFormValues.url}
                  onChange={(e) => setItemFormValues((p) => ({ ...p, url: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white font-mono px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Mega Panel Column</label>
                <input
                  type="text"
                  placeholder="e.g. Academics — links with the same value share a column"
                  value={itemFormValues.group}
                  onChange={(e) => setItemFormValues((p) => ({ ...p, group: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400">Sub-links are grouped into named columns in the desktop dropdown panel. Leave empty for no group.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Quote (About mega panel)</label>
                <input
                  type="text"
                  placeholder="italic text shown next to the About SVIT links"
                  value={itemFormValues.quote}
                  onChange={(e) => setItemFormValues((p) => ({ ...p, quote: e.target.value }))}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">
                  {editingItem ? 'Save Link' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
