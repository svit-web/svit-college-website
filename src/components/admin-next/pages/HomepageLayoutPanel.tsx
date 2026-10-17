'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  DEFAULT_HOMEPAGE_LAYOUT,
  HOMEPAGE_SECTIONS,
  type HomepageLayoutEntry,
} from '@/lib/homepage-layout';
import { saveHomepageLayout } from '@/lib/homepage-layout-next';

const META = Object.fromEntries(HOMEPAGE_SECTIONS.map((s) => [s.id, s]));

export function HomepageLayoutPanel({
  initialLayout,
  userId,
}: {
  initialLayout: HomepageLayoutEntry[];
  userId: string;
}) {
  const [saved, setSaved] = useState(initialLayout);
  const [layout, setLayout] = useState(initialLayout);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(layout) !== JSON.stringify(saved);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= layout.length) return;
    const next = [...layout];
    [next[i], next[j]] = [next[j], next[i]];
    setLayout(next);
  };
  const toggle = (i: number) =>
    setLayout(layout.map((e, k) => (k === i ? { ...e, visible: !e.visible } : e)));

  const save = async () => {
    setSaving(true);
    try {
      const result = await saveHomepageLayout(layout, userId);
      setSaved(result);
      setLayout(result);
      toast.success('Homepage layout saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the layout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-500">
        Reorder the homepage sections and switch them on or off. The hero always stays first, and the
        popup has its own tab. A section that is on but has no content stays hidden.
      </p>

      <ol className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
        {layout.map((entry, i) => (
          <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-5 text-xs font-semibold text-slate-400">{i + 1}</span>
            <div className={`min-w-0 flex-1 ${entry.visible ? '' : 'opacity-50'}`}>
              <div className="text-sm font-semibold text-navy">{META[entry.id].label}</div>
              <div className="text-xs text-slate-500">{META[entry.id].hint}</div>
            </div>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label={`Move ${META[entry.id].label} up`}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === layout.length - 1}
              aria-label={`Move ${META[entry.id].label} down`}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={entry.visible}
              aria-label={`Show ${META[entry.id].label}`}
              onClick={() => toggle(i)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${entry.visible ? 'bg-crimson' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${entry.visible ? 'left-[22px]' : 'left-0.5'}`}
              />
            </button>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded bg-crimson px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
        <button
          type="button"
          onClick={() => setLayout(DEFAULT_HOMEPAGE_LAYOUT)}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to default
        </button>
        {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
      </div>
    </div>
  );
}
