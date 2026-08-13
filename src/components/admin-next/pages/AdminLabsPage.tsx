'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { FlaskConical, Plus, Trash2, Save, Loader2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/app/lib/auth/admin';

interface Highlight {
  title: string;
  description: string;
}
interface Lab {
  id: string;
  name: string;
  slug: string;
  department_id: string | null;
  status: string;
  subtitle: string | null;
  accent_color: string | null;
  description: string | null;
  metadata: {
    highlights?: Highlight[];
    imageUrl?: string;
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function AdminLabsPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []);
  const isGlobal = admin.roles.some((r) => r.code === 'admin' || r.code === 'editor');
  const deptAdminRole = admin.roles.find((r) => r.code === 'department_admin' && r.department_id);
  const lockedDeptId: string | null = isGlobal ? null : deptAdminRole?.department_id ?? null;

  const [departments, setDepartments] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(lockedDeptId ?? '');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    slug: string;
    department_id: string;
    subtitle: string;
    accent: string;
    description: string;
    highlights: Highlight[];
    imageUrl: string;
    status: string;
  }>({
    name: '',
    slug: '',
    department_id: lockedDeptId ?? '',
    subtitle: '',
    accent: '',
    description: '',
    highlights: [],
    imageUrl: '',
    status: 'published',
  });

  useEffect(() => {
    if (isGlobal) {
      supabase
        .from('departments')
        .select('id, name, code')
        .is('deleted_at', null)
        .order('name')
        .then(({ data }) => setDepartments(data ?? []));
    } else if (deptAdminRole?.department_id) {
      supabase
        .from('departments')
        .select('id, name, code')
        .eq('id', deptAdminRole.department_id)
        .then(({ data }) => setDepartments(data ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGlobal, deptAdminRole?.department_id]);

  useEffect(() => {
    if (selectedDeptId) fetchLabs(selectedDeptId);
    else setLabs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeptId]);

  async function fetchLabs(deptId: string) {
    setListLoading(true);
    const { data, error } = await supabase
      .from('facilities')
      .select('id, name, slug, department_id, status, subtitle, accent_color, description, metadata')
      .eq('department_id', deptId)
      .eq('facility_type', 'laboratory')
      .is('deleted_at', null)
      .order('name');
    if (error) toast.error(error.message);
    else setLabs((data ?? []) as unknown as Lab[]);
    setListLoading(false);
  }

  function openNew() {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      department_id: lockedDeptId ?? selectedDeptId,
      subtitle: '',
      accent: '',
      description: '',
      highlights: [],
      imageUrl: '',
      status: 'published',
    });
    setPanelOpen(true);
  }

  function openEdit(lab: Lab) {
    setEditingId(lab.id);
    setForm({
      name: lab.name,
      slug: lab.slug,
      department_id: lab.department_id ?? '',
      subtitle: lab.subtitle ?? '',
      accent: lab.accent_color ?? '',
      description: lab.description ?? '',
      highlights: lab.metadata.highlights ?? [],
      imageUrl: lab.metadata.imageUrl ?? '',
      status: lab.status,
    });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId(null);
  }

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addHighlight() {
    setForm((p) => ({ ...p, highlights: [...p.highlights, { title: '', description: '' }] }));
  }

  function updateHighlight(i: number, key: 'title' | 'description', val: string) {
    setForm((p) => {
      const hl = [...p.highlights];
      hl[i] = { ...hl[i], [key]: val };
      return { ...p, highlights: hl };
    });
  }

  function removeHighlight(i: number) {
    setForm((p) => ({ ...p, highlights: p.highlights.filter((_, idx) => idx !== i) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.department_id) {
      toast.error('Select a department first.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        department_id: form.department_id,
        facility_type: 'laboratory' as const,
        status: form.status,
        subtitle: form.subtitle.trim() || null,
        accent_color: form.accent.trim() || null,
        description: form.description.trim() || null,
        metadata: {
          highlights: form.highlights.filter((h) => h.title.trim()),
          imageUrl: form.imageUrl || null,
        },
        updated_by: admin.id,
      };

      if (editingId) {
        const { error } = await supabase.from('facilities').update(payload as any).eq('id', editingId);
        if (error) throw error;
        toast.success('Lab updated!');
      } else {
        const { error } = await supabase.from('facilities').insert({ ...payload, created_by: admin.id } as any);
        if (error) throw error;
        toast.success('Lab created!');
      }
      closePanel();
      if (form.department_id) fetchLabs(form.department_id);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lab: Lab) {
    if (!confirm(`Move "${lab.name}" to trash?`)) return;
    const { error } = await supabase
      .from('facilities')
      .update({ deleted_at: new Date().toISOString(), deleted_by: admin.id })
      .eq('id', lab.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Moved to trash.');
      fetchLabs(selectedDeptId);
    }
  }

  const filtered = useMemo(() => {
    if (!search) return labs;
    const q = search.toLowerCase();
    return labs.filter((l) => l.name.toLowerCase().includes(q));
  }, [labs, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-navy">
            <FlaskConical className="h-5 w-5 text-crimson" />
            Labs &amp; Facilities
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {lockedDeptId ? `Showing labs for your department` : 'Manage labs across all departments'}
          </p>
        </div>
        <button
          onClick={openNew}
          disabled={!selectedDeptId && !lockedDeptId}
          className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-40 transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Lab
        </button>
      </div>

      {isGlobal && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-crimson focus:outline-none"
          >
            <option value="">— Select department —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {!isGlobal && departments.length > 0 && <div className="text-sm font-semibold text-navy">{departments[0]?.name}</div>}

      {selectedDeptId && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search labs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-crimson focus:outline-none"
          />
        </div>
      )}

      {!selectedDeptId ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm text-slate-400">Select a department to see its labs.</p>
        </div>
      ) : listLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-crimson" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center">
          <FlaskConical className="h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No labs found.</p>
          <button onClick={openNew} className="mt-2 text-xs text-crimson hover:underline">
            Add first lab →
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lab) => (
            <div
              key={lab.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition"
              onClick={() => openEdit(lab)}
            >
              {lab.metadata.imageUrl && (
                <img src={lab.metadata.imageUrl} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />
              )}
              {lab.accent_color && (
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-crimson">{lab.accent_color}</div>
              )}
              <p className="font-semibold text-slate-900 text-sm leading-snug">{lab.name}</p>
              {lab.subtitle && <p className="mt-0.5 text-xs text-slate-500 truncate">{lab.subtitle}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                    lab.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  )}
                >
                  {lab.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(lab);
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closePanel} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[#16181d] shadow-2xl border-l border-zinc-800 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
              <h2 className="font-semibold text-white text-sm">{editingId ? 'Edit Lab' : 'New Lab'}</h2>
              <button onClick={closePanel} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 admin-scroll">
              {isGlobal ? (
                <div className="space-y-1">
                  <label className="field-label">Department</label>
                  <select
                    required
                    value={form.department_id}
                    onChange={(e) => setField('department_id', e.target.value)}
                    className="field-input"
                  >
                    <option value="">Select department…</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-400">
                  Department: <span className="font-semibold text-white">{departments[0]?.name}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="field-label">Status</label>
                  <select value={form.status} onChange={(e) => setField('status', e.target.value)} className="field-input">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="field-label">Accent Label</label>
                  <input
                    type="text"
                    value={form.accent}
                    onChange={(e) => setField('accent', e.target.value)}
                    placeholder="e.g. AI Lab"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="field-label">Lab Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setField('name', e.target.value);
                    if (!editingId) setField('slug', slugify(e.target.value));
                  }}
                  className="field-input"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField('slug', slugify(e.target.value))}
                  className="field-input"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Subtitle</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setField('subtitle', e.target.value)}
                  placeholder="Brief one-liner"
                  className="field-input"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="field-input resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="field-label">Photo</label>
                <MediaUploader value={form.imageUrl} onChange={(url) => setField('imageUrl', url)} type="image" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="field-label">Highlights</label>
                  <button type="button" onClick={addHighlight} className="flex items-center gap-1 text-xs text-crimson hover:underline">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
                {form.highlights.length === 0 && <p className="text-xs text-zinc-600">No highlights yet.</p>}
                {form.highlights.map((hl, i) => (
                  <div key={i} className="flex gap-2 items-start rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={hl.title}
                        onChange={(e) => updateHighlight(i, 'title', e.target.value)}
                        placeholder="Title"
                        className="field-input text-xs"
                      />
                      <input
                        type="text"
                        value={hl.description}
                        onChange={(e) => updateHighlight(i, 'description', e.target.value)}
                        placeholder="Description"
                        className="field-input text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHighlight(i)}
                      className="mt-1 rounded p-1 text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-50 transition"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? 'Save Changes' : 'Create Lab'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
