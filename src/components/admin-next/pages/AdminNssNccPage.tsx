'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { Shield, Images, Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/app/lib/auth/admin';

type FocalX = 'left' | 'center' | 'right';
type FocalY = 'top' | 'center' | 'bottom';

interface GalleryImage {
  id: string;
  url: string;
  focalX?: FocalX;
  focalY?: FocalY;
}

interface Highlight {
  title: string;
  description: string;
}

interface NssNccCenter {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  metadata: {
    highlights?: Highlight[];
    gallery?: { aspectRatio?: string; images?: GalleryImage[] };
    [key: string]: any;
  };
}

// Fixed at 4:3 for a consistent look across all slides — not admin-editable.
const PHOTO_ASPECT_RATIO = '4/3';

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `img-${Date.now()}-${Math.random()}`;
}

export function AdminNssNccPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [center, setCenter] = useState<NssNccCenter | null>(null);
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('centers')
      .select('id, name, subtitle, description, metadata')
      .eq('slug', 'nss-ncc')
      .maybeSingle();

    if (error) toast.error(error.message);

    const typed = (data as unknown as NssNccCenter) ?? null;
    setCenter(typed);
    setName(typed?.name ?? '');
    setSubtitle(typed?.subtitle ?? '');
    setDescription(typed?.description ?? '');
    setHighlights(typed?.metadata?.highlights ?? []);
    setImages(typed?.metadata?.gallery?.images ?? []);
    setLoading(false);
  }

  function addImage(url: string) {
    setImages((prev) => [...prev, { id: newId(), url, focalX: 'center', focalY: 'center' }]);
  }

  function updateImage(id: string, patch: Partial<GalleryImage>) {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, ...patch } : img)));
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function moveImage(id: string, dir: -1 | 1) {
    setImages((prev) => {
      const idx = prev.findIndex((img) => img.id === id);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, { title: '', description: '' }]);
  }

  function updateHighlight(index: number, patch: Partial<Highlight>) {
    setHighlights((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }

  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!center) {
      toast.error('NSS / NCC record not found.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('centers')
        .update({
          name,
          subtitle: subtitle || null,
          description: description || null,
          metadata: {
            ...center.metadata,
            highlights: highlights.filter((h) => h.title.trim() || h.description.trim()),
            gallery: { aspectRatio: PHOTO_ASPECT_RATIO, images },
          },
          updated_by: admin.id,
        } as any)
        .eq('id', center.id);
      if (error) throw error;
      toast.success('NSS / NCC page updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-crimson" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-navy">
            <Shield className="h-5 w-5 text-crimson" />
            NSS / NCC
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage the content and photo slider shown on the public NSS / NCC page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !center}
          className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-40 transition shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {!center && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          No centre with slug &quot;nss-ncc&quot; was found.
        </div>
      )}

      {/* Basic content */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Content</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-crimson focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-crimson focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-crimson focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Highlights</h2>
        <div className="space-y-3">
          {highlights.map((h, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Highlight title"
                  value={h.title}
                  onChange={(e) => updateHighlight(i, { title: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-crimson focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                  aria-label="Remove highlight"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Description"
                value={h.description}
                onChange={(e) => updateHighlight(i, { description: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-crimson focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addHighlight}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-crimson hover:text-crimson transition"
        >
          <Plus className="h-3.5 w-3.5" /> Add highlight
        </button>
      </section>

      {/* Photo slider */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
          <Images className="h-4 w-4 text-crimson" />
          Photo Slider
        </h2>
        <p className="text-xs text-slate-500">
          Photos auto-rotate every 3 seconds on the public page once there are 2 or more. Shown in a standard 4:3
          shape, cropped to fill the frame — use the focal point buttons to choose which part stays visible.
        </p>

        <div className="space-y-3">
          {images.map((img, i) => (
            <div key={img.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex gap-3">
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${img.focalX ?? 'center'} ${img.focalY ?? 'center'}` }}
                  />
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Focal point</span>
                    <div className="grid grid-cols-3 gap-0.5 rounded-md border border-slate-200 p-0.5">
                      {(['top', 'center', 'bottom'] as FocalY[]).map((fy) =>
                        (['left', 'center', 'right'] as FocalX[]).map((fx) => {
                          const active = (img.focalX ?? 'center') === fx && (img.focalY ?? 'center') === fy;
                          return (
                            <button
                              key={`${fx}-${fy}`}
                              type="button"
                              title={`${fy} ${fx}`}
                              onClick={() => updateImage(img.id, { focalX: fx, focalY: fy })}
                              className={cn(
                                'h-4 w-4 rounded-sm border transition',
                                active ? 'border-crimson bg-crimson' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'
                              )}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(img.id, -1)}
                    disabled={i === 0}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 transition"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(img.id, 1)}
                    disabled={i === images.length - 1}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 transition"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Plus className="h-3.5 w-3.5" /> Add a photo
          </div>
          <MediaUploader value="" onChange={addImage} type="image" />
        </div>
      </section>
    </div>
  );
}
