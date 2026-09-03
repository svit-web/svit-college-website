'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { MediaUploader } from '@/components/admin-next/MediaUploader';
import { BookOpen, Images, Save, Loader2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/app/lib/auth/admin';

interface College {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
}

type FocalX = 'left' | 'center' | 'right';
type FocalY = 'top' | 'center' | 'bottom';

interface GalleryImage {
  id: string;
  url: string;
  focalX?: FocalX;
  focalY?: FocalY;
}

interface LibraryFacility {
  id: string;
  metadata: {
    highlights?: { title: string; description: string }[];
    institute_libraries?: { college_id: string; book_count: number }[];
    gallery?: { aspectRatio?: string; images?: GalleryImage[] };
    [key: string]: any;
  };
}

// Fixed at 4:3 for a consistent look across all slides — not admin-editable.
const PHOTO_ASPECT_RATIO = '4/3';

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `img-${Date.now()}-${Math.random()}`;
}

export function AdminLibraryPage({ admin }: { admin: AdminUser }) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [facility, setFacility] = useState<LibraryFacility | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const [{ data: collegesData, error: collegesErr }, { data: facilityData, error: facilityErr }] =
      await Promise.all([
        supabase.from('colleges').select('id, name, code, logo_url').is('deleted_at', null).order('name'),
        supabase.from('facilities').select('id, metadata').eq('slug', 'library').maybeSingle(),
      ]);

    if (collegesErr) toast.error(collegesErr.message);
    if (facilityErr) toast.error(facilityErr.message);

    setColleges((collegesData ?? []) as College[]);
    const typedFacility = (facilityData as unknown as LibraryFacility) ?? null;
    setFacility(typedFacility);

    const initialCounts: Record<string, number> = {};
    for (const entry of typedFacility?.metadata?.institute_libraries ?? []) {
      initialCounts[entry.college_id] = entry.book_count;
    }
    setCounts(initialCounts);
    setImages(typedFacility?.metadata?.gallery?.images ?? []);
    setLoading(false);
  }

  const total = colleges.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);

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

  async function handleSave() {
    if (!facility) {
      toast.error('Library facility not found.');
      return;
    }
    setSaving(true);
    try {
      const institute_libraries = colleges.map((c) => ({
        college_id: c.id,
        book_count: Math.max(0, Math.floor(counts[c.id] ?? 0)),
      }));
      const { error } = await supabase
        .from('facilities')
        .update({
          metadata: {
            ...facility.metadata,
            institute_libraries,
            gallery: { aspectRatio: PHOTO_ASPECT_RATIO, images },
          },
          updated_by: admin.id,
        } as any)
        .eq('id', facility.id);
      if (error) throw error;
      toast.success('Library page updated!');
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
            <BookOpen className="h-5 w-5 text-crimson" />
            Central Library
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage the photo slider and book counts shown on the public library page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !facility}
          className="flex items-center gap-1.5 rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson/90 disabled:opacity-40 transition shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {!facility && (
        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          No facility with slug &quot;library&quot; was found. Create it first under Academics → Facilities.
        </div>
      )}

      {/* Photo slider */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-navy">
          <Images className="h-4 w-4 text-crimson" />
          Photo Slider
        </h2>
        <p className="text-xs text-slate-500">
          Photos are shown in a standard 4:3 shape, cropped to fill the frame. Use the focal point buttons on each
          photo to choose which part stays visible.
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

      {/* Book counts */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Book Counts</h2>
        <p className="text-xs text-slate-500">
          Set the number of books held at each institute&apos;s library. The public page shows these totals summed
          together.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
          {colleges.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4">
              {c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo_url} alt="" className="h-10 w-10 shrink-0 rounded object-contain border border-slate-200 p-1" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
                  {c.code}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-crimson">{c.code}</div>
                <div className="text-sm font-semibold text-slate-900 truncate">{c.name}</div>
              </div>
              <input
                type="number"
                min={0}
                value={counts[c.id] ?? 0}
                onChange={(e) => setCounts((p) => ({ ...p, [c.id]: Number(e.target.value) }))}
                className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-right focus:border-crimson focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-navy/15 bg-navy/5 px-4 py-3">
          <span className="text-sm font-semibold text-navy">Total across all institutes</span>
          <span className="font-display text-lg font-bold text-navy">{total.toLocaleString('en-IN')}</span>
        </div>
      </section>
    </div>
  );
}
