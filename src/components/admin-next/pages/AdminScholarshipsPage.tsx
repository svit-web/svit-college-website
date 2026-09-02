'use client';

import { useEffect, useState } from 'react';
import { getAllScholarshipsAdmin, type Scholarship } from '@/lib/scholarships.functions';
import { upsertScholarship, deleteScholarship } from '@/lib/scholarships-next';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, GraduationCap } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'merit', label: 'Merit' },
  { value: 'need', label: 'Need-Based' },
  { value: 'govt', label: 'Government' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const BLANK: Partial<Scholarship> & { name: string; type: string } = {
  name: '',
  type: 'merit',
  description: '',
  eligibility: '',
  amount: '',
  provider: '',
  status: 'published',
  sort_order: 0,
};

export function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState<(Partial<Scholarship> & { name: string; type: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setFetching(true);
    try {
      const data = await getAllScholarshipsAdmin();
      setScholarships(data);
    } catch {
      toast.error('Failed to load scholarships');
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await upsertScholarship(editing);
      toast.success(editing.id ? 'Scholarship updated' : 'Scholarship added');
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this scholarship?')) return;
    setDeletingId(id);
    try {
      await deleteScholarship(id);
      toast.success('Deleted');
      await load();
    } catch (e: any) {
      toast.error(e.message ?? 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  const field = (key: keyof typeof BLANK, label: string, type: 'text' | 'textarea' | 'number' | 'select' = 'text') => {
    const val = (editing as any)?.[key] ?? '';
    if (type === 'textarea')
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
          <textarea
            rows={3}
            value={val}
            onChange={(e) => setEditing((p) => ({ ...p!, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
          />
        </div>
      );
    if (type === 'select')
      return (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
          <select
            value={val}
            onChange={(e) => setEditing((p) => ({ ...p!, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
          >
            {key === 'type' && TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            {key === 'status' && (
              <>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </>
            )}
          </select>
        </div>
      );
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
        <input
          type={type}
          value={val}
          onChange={(e) => setEditing((p) => ({ ...p!, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-crimson" />
            Scholarships
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage scholarship listings shown on the public Admissions page.</p>
        </div>
        <button
          onClick={() => setEditing({ ...BLANK })}
          className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition"
        >
          <Plus className="h-4 w-4" /> Add Scholarship
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-navy text-base">{editing.id ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {field('name', 'Name *')}
              <div className="grid grid-cols-2 gap-4">
                {field('type', 'Type', 'select')}
                {field('status', 'Status', 'select')}
              </div>
              {field('provider', 'Provider / Authority')}
              {field('amount', 'Amount (e.g. "Up to ₹50,000/year")')}
              {field('description', 'Description', 'textarea')}
              {field('eligibility', 'Eligibility Criteria', 'textarea')}
              {field('sort_order', 'Sort Order', 'number')}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white hover:bg-crimson/90 transition disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-crimson" />
        </div>
      ) : scholarships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No scholarships yet. Click &quot;Add Scholarship&quot; to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {scholarships.map((s, i) => (
                <tr key={s.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="p-3 font-semibold text-navy">{s.name}</td>
                  <td className="p-3 text-slate-500 capitalize">{s.type}</td>
                  <td className="p-3 text-slate-500">{s.amount || '—'}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-xs">{s.sort_order}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button onClick={() => setEditing({ ...s })} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy transition" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
