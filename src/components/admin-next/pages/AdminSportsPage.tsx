'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { Plus, Trash2, Edit2, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { EntryPhotosEditor } from '@/components/admin-next/EntryPhotosEditor';
import type { AdminUser } from '@/app/lib/auth/admin';

export const CATEGORIES = ['outdoor', 'indoor', 'aquatic', 'combat'] as const;

const EMPTY_SPORT = {
  name: '',
  slug: '',
  category: 'outdoor' as const,
  description: '',
  card_photo_url: '',
  album_id: null as string | null,
  has_detail_page: false,
  players_count: '' as number | '',
  coach_name: '',
  coach_image_url: '',
  is_active: true,
  sort_order: 10,
  status: 'published',
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Sports achievements (level/position/date, one per sport) now live in the
// main `achievements` table (category='sports') since sports_achievements was
// dropped — see docs/adr/0001-entry-card-photo-and-album.md. Edit them via the
// achievements admin, not here.
export function AdminSportsPage({ admin }: { admin: AdminUser }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
            <Trophy className="h-6 w-6 text-gold" /> Sports &amp; Athletics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage sports disciplines shown on the Campus Life page. Sports achievements are edited on the Achievements page.
          </p>
        </div>

        <SportsManager userId={admin.id} />
      </div>
    </div>
  );
}

function SportsManager({ userId }: { userId: string | undefined }) {
  const supabase = useMemo(() => createClient(), []);
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<typeof EMPTY_SPORT>({ ...EMPTY_SPORT });

  useEffect(() => {
    loadSports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSports() {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('sports')
      .select(
        'id, name, slug, category, description, card_photo_url, album_id, has_detail_page, players_count, coach_name, coach_image_url, is_active, sort_order, status, metadata',
      )
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    if (error) toast.error(error.message);
    else setSports(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY_SPORT });
    setModalOpen(true);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({
      name: s.name ?? '',
      slug: s.slug ?? '',
      category: s.category ?? 'outdoor',
      description: s.description ?? '',
      card_photo_url: s.card_photo_url ?? '',
      album_id: s.album_id ?? null,
      has_detail_page: s.has_detail_page ?? false,
      players_count: s.players_count ?? '',
      coach_name: s.coach_name ?? '',
      coach_image_url: s.coach_image_url ?? '',
      is_active: s.is_active ?? true,
      sort_order: s.sort_order ?? 10,
      status: s.status ?? 'published',
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, players_count: form.players_count === '' ? null : Number(form.players_count) };
      if (editing) {
        const { error } = await (supabase as any).from('sports').update({ ...payload, updated_by: userId }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Sport updated!');
      } else {
        const { error } = await (supabase as any).from('sports').insert({ ...payload, created_by: userId });
        if (error) throw error;
        toast.success('Sport added!');
      }
      setModalOpen(false);
      loadSports();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(s: any) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    const { error } = await (supabase as any)
      .from('sports')
      .update({ deleted_at: new Date().toISOString(), deleted_by: userId })
      .eq('id', s.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Deleted');
      loadSports();
    }
  }

  const f = (key: keyof typeof EMPTY_SPORT, val: any) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-navy">Sports Disciplines ({sports.length})</span>
          <button onClick={openAdd} className="flex items-center gap-1.5 rounded bg-crimson px-3 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90">
            <Plus className="h-3.5 w-3.5" /> Add Sport
          </button>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-crimson" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sports.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">
                {s.card_photo_url && (
                  <img src={s.card_photo_url} alt={s.name} className="h-10 w-16 rounded object-cover shrink-0 border border-slate-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 capitalize">{s.category}</span>
                    {!s.is_active && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Inactive</span>}
                  </div>
                  {s.description && <p className="text-xs text-slate-400 truncate mt-0.5">{s.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(s)} className="rounded p-1 text-slate-400 hover:text-navy hover:bg-slate-100 transition">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(s)} className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {sports.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No sports yet. Click &quot;Add Sport&quot; to get started.</div>}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="mb-4 font-display text-lg font-bold text-navy">{editing ? 'Edit Sport' : 'Add Sport'}</h3>
            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => {
                      f('name', e.target.value);
                      if (!editing) f('slug', toSlug(e.target.value));
                    }}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => f('slug', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 focus:border-crimson focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => f('category', e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => f('description', e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-crimson focus:outline-none"
                />
              </div>

              <EntryPhotosEditor
                tableId="sports"
                recordId={editing?.id ?? null}
                primaryKey="id"
                values={form}
                onChange={(name, value) => setForm((p) => ({ ...p, [name]: value }))}
                hasDetailPageField
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Players</label>
                  <input
                    type="number"
                    value={form.players_count}
                    onChange={(e) => f('players_count', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Coach Name</label>
                  <input
                    value={form.coach_name}
                    onChange={(e) => f('coach_name', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-slate-600">Coach Photo</label>
                <MediaUploader value={form.coach_image_url} onChange={(url) => f('coach_image_url', url)} bucketName="media" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Sort Order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => f('sort_order', Number(e.target.value))}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => f('status', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sport_active"
                  checked={form.is_active}
                  onChange={(e) => f('is_active', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-200 text-crimson"
                />
                <label htmlFor="sport_active" className="text-sm text-slate-600">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs text-slate-500 hover:text-navy">
                  Cancel
                </button>
                <button type="submit" className="rounded bg-crimson px-4 py-2 text-xs font-semibold text-white hover:bg-crimson/90">
                  {editing ? 'Save Changes' : 'Add Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
