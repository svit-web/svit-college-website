'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/app/lib/supabase/client';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { HOMEPAGE_ROTATE_MS } from '@/lib/theme';

// Per-college landing page content that isn't a homepage item: the hero
// slideshow photos and the Vision & Mission section. Stored on the college
// row's metadata (hero_photos, vision, mission_points) and read by
// src/app/(site)/colleges/[college]/page.tsx. The photo look (visibility, tint,
// blur, fade) still comes from the shared Hero Appearance tab.

interface CollegeRow {
  id: string;
  name: string;
  code: string;
  slug: string;
  metadata: Record<string, unknown> | null;
}

interface Draft {
  heroPhotos: string[];
  vision: string;
  missionPoints: string[];
}

function toDraft(meta: Record<string, unknown> | null): Draft {
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  return {
    heroPhotos: strings(meta?.hero_photos),
    vision: typeof meta?.vision === 'string' ? meta.vision : '',
    missionPoints: strings(meta?.mission_points),
  };
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function CollegePagesPanel() {
  const [colleges, setColleges] = useState<CollegeRow[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    createClient()
      .from('colleges')
      .select('id, name, code, slug, metadata')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        const rows = (data ?? []) as CollegeRow[];
        setColleges(rows);
        if (rows[0]) {
          setSelectedId(rows[0].id);
          setDraft(toDraft(rows[0].metadata));
        }
      });
  }, []);

  const selected = colleges?.find((c) => c.id === selectedId) ?? null;

  function select(c: CollegeRow) {
    setSelectedId(c.id);
    setDraft(toDraft(c.metadata));
  }

  async function save() {
    if (!selected || !draft) return;
    setSaving(true);
    try {
      const supabase = createClient();
      // Re-read so keys other screens own (e.g. principal details) are kept.
      const { data: current, error: readError } = await supabase
        .from('colleges')
        .select('metadata')
        .eq('id', selected.id)
        .single();
      if (readError) throw readError;
      const metadata = {
        ...((current?.metadata as Record<string, unknown>) ?? {}),
        hero_photos: draft.heroPhotos,
        vision: draft.vision.trim(),
        mission_points: draft.missionPoints.map((p) => p.trim()).filter(Boolean),
      };
      const { data, error } = await supabase
        .from('colleges')
        .update({ metadata, updated_at: new Date().toISOString() } as never)
        .eq('id', selected.id)
        .select('id');
      if (error) throw error;
      // RLS turns a denied UPDATE into "0 rows", not an error.
      if (!data || data.length === 0) throw new Error('Not saved: you do not have permission to edit this college');
      setColleges((prev) => (prev ?? []).map((c) => (c.id === selected.id ? { ...c, metadata } : c)));
      setDraft(toDraft(metadata));
      toast.success(`${selected.code} page saved — live on the site now.`);
    } catch (e) {
      toast.error((e as { message?: string })?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!colleges) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-crimson" />
      </div>
    );
  }
  if (!selected || !draft) {
    return <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">No colleges found.</div>;
  }

  const setPoints = (fn: (p: string[]) => string[]) => setDraft((d) => (d ? { ...d, missionPoints: fn(d.missionPoints) } : d));
  const setPhotos = (fn: (p: string[]) => string[]) => setDraft((d) => (d ? { ...d, heroPhotos: fn(d.heroPhotos) } : d));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-700">College:</span>
        {colleges.map((c) => (
          <button
            key={c.id}
            onClick={() => select(c)}
            title={c.name}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition ${c.id === selected.id ? 'bg-navy text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
          >
            {c.code}
          </button>
        ))}
        <a
          href={`/colleges/${selected.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-crimson hover:underline"
        >
          View {selected.code} page <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded bg-crimson px-4 py-1.5 text-xs font-semibold text-white hover:bg-crimson/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save {selected.code}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-navy">Hero photos — {selected.name}</h2>
        <p className="mt-1 text-xs text-slate-500">
          Shown behind the title at the top of this college&apos;s page. Several photos crossfade every{' '}
          {HOMEPAGE_ROTATE_MS / 1000} seconds; drag to reorder. With no photos here, the page uses the image of
          its &quot;Hero Section&quot; homepage item. Visibility, tint and blur are set in the Hero Appearance tab.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {draft.heroPhotos.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData('text/plain'));
                setPhotos((p) => move(p, from, i));
              }}
              className="group relative cursor-grab overflow-hidden rounded-lg border border-slate-200 active:cursor-grabbing"
            >
              <div className="relative aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                title="Remove photo"
                className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {i + 1}
              </span>
            </div>
          ))}
          <div>
            <MediaUploader value="" onChange={(url: string) => url && setPhotos((p) => [...p, url])} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-navy">Vision</h2>
          <p className="text-xs text-slate-500">Leave Vision and Mission both empty to hide the section on this college&apos;s page.</p>
          <textarea
            rows={8}
            value={draft.vision}
            onChange={(e) => setDraft({ ...draft, vision: e.target.value })}
            placeholder={`The vision of ${selected.code}…`}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-navy">Mission</h2>
          <p className="text-xs text-slate-500">Numbered points, in this order. Empty points are dropped on save.</p>
          {draft.missionPoints.map((p, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-navy">
                {i + 1}
              </span>
              <textarea
                rows={2}
                value={p}
                onChange={(e) => setPoints((pts) => pts.map((x, j) => (j === i ? e.target.value : x)))}
                className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-crimson focus:outline-none"
              />
              <div className="flex flex-col">
                <button type="button" disabled={i === 0} onClick={() => setPoints((pts) => move(pts, i, i - 1))} aria-label="Move up" className="rounded p-1 text-slate-400 hover:text-navy disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" disabled={i === draft.missionPoints.length - 1} onClick={() => setPoints((pts) => move(pts, i, i + 1))} aria-label="Move down" className="rounded p-1 text-slate-400 hover:text-navy disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPoints((pts) => pts.filter((_, j) => j !== i))} aria-label="Remove" className="rounded p-1 text-slate-400 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPoints((pts) => [...pts, ''])}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> Add mission point
          </button>
        </div>
      </div>
    </div>
  );
}
