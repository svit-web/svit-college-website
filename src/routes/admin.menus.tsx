import { useEffect, useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Menu,
  Plus,
  Trash2,
  Edit2,
  Folder,
  File,
  ChevronDown,
  ChevronRight,
  Loader2,
  Save,
  Link as LinkIcon,
  CornerDownRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/menus")({
  component: AdminMenusPage
});

interface MenuItemNode {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  link_type: string;
  url: string | null;
  page_id: string | null;
  icon: string | null;
  sort_order: number;
  status: string;
  children?: MenuItemNode[];
}

function AdminMenusPage() {
  const { user } = useAdminAuth();
  
  // States
  const [menusList, setMenusList] = useState<any[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>("");
  const [loadingMenus, setLoadingMenus] = useState(true);
  
  const [menuItems, setMenuItems] = useState<MenuItemNode[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Modals / Editors
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [newMenuValues, setNewMenuValues] = useState({ name: "", code: "main" });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemNode | null>(null);
  const [itemFormValues, setItemFormValues] = useState({
    title: "",
    url: "",
    link_type: "custom",
    icon: "",
    sort_order: 0,
    parent_id: "" as string | null
  });

  // Load list of menus
  useEffect(() => {
    loadMenus();
  }, []);

  // Load menu items when selectedMenuId changes
  useEffect(() => {
    if (selectedMenuId) {
      loadMenuItems(selectedMenuId);
    } else {
      setMenuItems([]);
    }
  }, [selectedMenuId]);

  async function loadMenus() {
    setLoadingMenus(true);
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) throw error;
      setMenusList(data || []);
      if (data && data.length > 0 && !selectedMenuId) {
        setSelectedMenuId(data[0].id);
      }
    } catch (err: any) {
      console.error("Error loading menus:", err);
      toast.error(`Failed to load menus list: ${err.message}`);
    } finally {
      setLoadingMenus(false);
    }
  }

  async function loadMenuItems(menuId: string) {
    setLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("menu_id", menuId)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      
      // Structure the list into a tree of parent -> children
      const tree = buildMenuTree(data || []);
      setMenuItems(tree);
    } catch (err: any) {
      console.error("Error loading menu items:", err);
      toast.error(`Failed to load menu tree: ${err.message}`);
    } finally {
      setLoadingItems(false);
    }
  }

  // Recursive tree builder
  function buildMenuTree(flatItems: any[]): MenuItemNode[] {
    const itemMap: Record<string, MenuItemNode> = {};
    const roots: MenuItemNode[] = [];

    // First pass: Map all items and initialize children array
    flatItems.forEach((item) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Second pass: Populate roots and child trees
    flatItems.forEach((item) => {
      const node = itemMap[item.id];
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children?.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children recursively
    const sortNodes = (nodes: MenuItemNode[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach((n) => {
        if (n.children) sortNodes(n.children);
      });
    };
    sortNodes(roots);

    return roots;
  }

  // Create Menu Action
  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("menus")
        .insert({
          name: newMenuValues.name,
          code: newMenuValues.code,
          status: "published"
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Menu created!");
      setIsMenuModalOpen(false);
      setNewMenuValues({ name: "", code: "main" });
      loadMenus();
      if (data) setSelectedMenuId(data.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Create / Update Menu Item Action
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuId) return;

    try {
      const payload: Record<string, any> = {
        menu_id: selectedMenuId,
        title: itemFormValues.title,
        link_type: itemFormValues.link_type,
        url: itemFormValues.url || null,
        icon: itemFormValues.icon || null,
        sort_order: Number(itemFormValues.sort_order),
        parent_id: itemFormValues.parent_id || null,
        status: "published"
      };

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from("menu_items")
          .update(payload as any)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Menu item updated!");
      } else {
        // Create
        const { error } = await supabase
          .from("menu_items")
          .insert(payload as any);

        if (error) throw error;
        toast.success("Menu item added to tree!");
      }

      setIsItemModalOpen(false);
      setEditingItem(null);
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Open item modal for creation
  const handleOpenAddItem = (parentId: string | null = null) => {
    setEditingItem(null);
    setItemFormValues({
      title: "",
      url: "",
      link_type: "custom",
      icon: "",
      sort_order: menuItems.length * 10,
      parent_id: parentId
    });
    setIsItemModalOpen(true);
  };

  // Open item modal for editing
  const handleOpenEditItem = (item: MenuItemNode) => {
    setEditingItem(item);
    setItemFormValues({
      title: item.title,
      url: item.url || "",
      link_type: item.link_type,
      icon: item.icon || "",
      sort_order: item.sort_order,
      parent_id: item.parent_id
    });
    setIsItemModalOpen(true);
  };

  // Delete Menu Item (soft delete)
  const handleDeleteItem = async (node: MenuItemNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const msg = hasChildren
      ? "Warning: This menu item has sub-links underneath it. Deleting it will soft-delete all nested sub-links as well. Continue?"
      : "Are you sure you want to remove this navigation link?";
    
    const confirmed = window.confirm(msg);
    if (!confirmed) return;

    try {
      // If has children, we need to delete children too
      if (hasChildren && node.children) {
        await Promise.all(
          node.children.map(async (child) => {
            await supabase.from("menu_items").update({
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id
            }).eq("id", child.id);
          })
        );
      }

      const { error } = await supabase
        .from("menu_items")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id
        })
        .eq("id", node.id);

      if (error) throw error;
      toast.success("Menu item removed successfully.");
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Reorder sort_order action (shifting sort order by index offsets)
  const handleShiftSort = async (item: MenuItemNode, direction: "up" | "down") => {
    // Find sibling array
    let siblings: MenuItemNode[] = [];
    if (item.parent_id) {
      // Find parent node in tree
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

    const idx = siblings.findIndex(s => s.id === item.id);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= siblings.length) return; // Out of bounds

    const targetItem = siblings[targetIdx];
    
    // Swap sort orders in database
    try {
      await supabase.from("menu_items").update({ sort_order: targetItem.sort_order }).eq("id", item.id);
      await supabase.from("menu_items").update({ sort_order: item.sort_order }).eq("id", targetItem.id);
      
      toast.success("Order rearranged.");
      loadMenuItems(selectedMenuId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Toggle expand node
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive Tree Node Renderer Component
  const renderTreeNode = (node: MenuItemNode, depth = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1.5">
        
        {/* Row Link Card */}
        <div
          className={`flex items-center justify-between rounded-lg border border-slate-850 bg-slate-900/10 p-3 hover:bg-slate-900/35 transition`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {depth > 0 && <CornerDownRight className="h-4 w-4 text-slate-700 shrink-0" />}
            
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="text-slate-500 hover:text-white shrink-0"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-4 h-4 shrink-0" /> // spacer
            )}

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-950 text-indigo-400 border border-slate-800">
              <Folder className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-200 truncate">{node.title}</h4>
              <p className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                <LinkIcon className="h-2.5 w-2.5" />
                <span>{node.url || "(No Link)"}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            
            {/* Shift Order Buttons */}
            <button
              onClick={() => handleShiftSort(node, "up")}
              className="rounded p-1 text-slate-650 hover:bg-slate-800 hover:text-white transition"
              title="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleShiftSort(node, "down")}
              className="rounded p-1 text-slate-655 hover:bg-slate-800 hover:text-white transition"
              title="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-800 mx-1" />

            <button
              onClick={() => handleOpenAddItem(node.id)}
              className="flex items-center gap-1 rounded bg-indigo-600/10 px-2 py-1 text-[10px] font-bold text-indigo-400 border border-indigo-500/15 hover:bg-indigo-650/20 transition"
              title="Add child sub-link"
            >
              <Plus className="h-3 w-3" />
              <span>Add Child</span>
            </button>

            <button
              onClick={() => handleOpenEditItem(node)}
              className="rounded p-1 text-slate-500 hover:bg-slate-850 hover:text-white transition"
              title="Edit Link"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => handleDeleteItem(node)}
              className="rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-450 transition"
              title="Remove Link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Child nodes */}
        {hasChildren && isExpanded && (
          <div className="space-y-1.5">
            {node.children?.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Navigation Menu Tree Manager
          </h1>
          <p className="text-sm text-slate-400">
            Build and arrange nested multi-level website menus and headers.
          </p>
        </div>

        <button
          onClick={() => setIsMenuModalOpen(true)}
          className="flex items-center gap-2 rounded bg-indigo-650 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-550 shadow transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Menu Group</span>
        </button>
      </div>

      {/* Select Menu group bar */}
      <div className="flex flex-col gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider block">Active Navigation Group</span>
          {loadingMenus ? (
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          ) : (
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
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
          className="flex items-center gap-2 rounded bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-650/15 disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Root Link</span>
        </button>
      </div>

      {/* Tree list area */}
      <div className="flex-1 rounded-xl border border-slate-850 bg-slate-950 p-6 shadow-xl min-h-[400px]">
        {loadingItems ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : menuItems.length > 0 ? (
          <div className="space-y-3">
            {menuItems.map((rootNode) => renderTreeNode(rootNode))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Menu className="h-14 w-14 text-slate-800" />
            <h3 className="mt-4 text-base font-bold text-white">Menu is Empty</h3>
            <p className="mt-2 max-w-sm text-xs text-slate-550">
              There are no links in this menu. Click the "Add Root Link" button above to register your first navigation link.
            </p>
          </div>
        )}
      </div>

      {/* ➕ MODAL: Create Menu Group dialog */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-md rounded-lg border border-slate-850 bg-slate-950 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">Create Navigation Menu</h3>
            
            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Menu Name (e.g. Header Navigation)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Header Menu"
                  value={newMenuValues.name}
                  onChange={(e) => setNewMenuValues(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">System Code (slug)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. main-header"
                  value={newMenuValues.code}
                  onChange={(e) => setNewMenuValues(p => ({ ...p, code: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="rounded border border-slate-850 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Create Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ MODAL: Add / Edit Link details dialog */}
      {isItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 z-50">
          <div className="w-full max-w-md rounded-lg border border-slate-850 bg-slate-950 p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white mb-4">
              {editingItem ? "Edit Navigation Link" : "Add Navigation Link"}
            </h3>
            
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Link Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admissions"
                  value={itemFormValues.title}
                  onChange={(e) => setItemFormValues(p => ({ ...p, title: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Link Type</label>
                  <select
                    value={itemFormValues.link_type}
                    onChange={(e) => setItemFormValues(p => ({ ...p, link_type: e.target.value }))}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="custom">Custom URL</option>
                    <option value="page">Inner Page</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-450 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={itemFormValues.sort_order}
                    onChange={(e) => setItemFormValues(p => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Target URL / Route Link</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /admissions or https://external.com"
                  value={itemFormValues.url}
                  onChange={(e) => setItemFormValues(p => ({ ...p, url: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-450 uppercase">Icon Class (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Home, Settings, User"
                  value={itemFormValues.icon}
                  onChange={(e) => setItemFormValues(p => ({ ...p, icon: e.target.value }))}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="rounded border border-slate-850 px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  {editingItem ? "Save Link" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
