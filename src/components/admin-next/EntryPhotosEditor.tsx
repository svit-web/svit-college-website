'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/app/lib/supabase/client';
import { uploadMediaFile } from '@/lib/upload-media-next';
import { MediaUploader } from './MediaUploader';

// The "Photos" section of an Entry's edit form (see CONTEXT.md: Entry, Card
// photo, Entry album, Detail page). Covers three columns of the Entry row:
//   card_photo_url  — bound to the outer form like any other field
//   album_id        — the Entry album; created + linked here, written directly
//   has_detail_page — bound to the outer form (only when the table has it)
//
// Entry album write order is dictated by RLS (20260923140100_entry_model_rls.sql):
//   1. INSERT gallery_albums with owner_table set and show_in_public_gallery=false
//      (allowed for any admin via is_any_admin()).
//   2. UPDATE the Entry row's album_id (the Entry table's own write policy).
//   3. Only then INSERT gallery_media — can_write_entry_album() looks for an Entry
//      row pointing at the album, so it is false until step 2 has committed.
// Hence the album can only be created for an Entry that already has a primary key.

interface AlbumPhoto {
  id: string;
  url: string;
  sort_order: number;
}

interface EntryPhotosEditorProps {
  tableId: string;
  // Primary key of the Entry being edited; null for a new, unsaved Entry.
  recordId: string | null;
  primaryKey: string;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  hasDetailPageField: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function rejectReason(file: File): string | null {
  if (!file.type.startsWith('image/')) return `${file.name}: not an image file`;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['heic', 'heif'].includes(ext) || ['image/heic', 'image/heif'].includes(file.type)) {
    return `${file.name}: HEIC/HEIF is not supported by browsers, convert to JPG or PNG first`;
  }
  return null;
}

export function EntryPhotosEditor({ tableId, recordId, primaryKey, values, onChange, hasDetailPageField }: EntryPhotosEditorProps) {
  const supabase = useMemo(() => createClient() as any, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const albumId: string | null = values.album_id || null;
  // Mirrors albumId synchronously so a second drop mid-upload never creates a second album.
  const albumIdRef = useRef<string | null>(albumId);
  albumIdRef.current = albumId || albumIdRef.current;
  const creatingRef = useRef<Promise<string> | null>(null);

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dropActive, setDropActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const busy = uploadingCount > 0;

  useEffect(() => {
    if (!albumId) {
      setPhotos([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPhotos(true);
      const { data, error } = await supabase
        .from('gallery_media')
        .select('id, url, sort_order')
        .eq('album_id', albumId)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) toast.error(`Could not load photos: ${error.message}`);
      else setPhotos(data ?? []);
      setLoadingPhotos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [albumId, supabase]);

  // Steps 1 + 2 of the RLS flow. Returns the linked album id.
  const createAndLinkAlbum = async (): Promise<string> => {
    const title = String(values.title || values.name || 'Untitled').trim() || 'Untitled';
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${slugify(title) || tableId}-${suffix}`;

    const { data: album, error: albumError } = await supabase
      .from('gallery_albums')
      .insert({ title, slug, owner_table: tableId, show_in_public_gallery: false, status: 'published' })
      .select('id')
      .single();
    if (albumError) throw new Error(`Could not create album: ${albumError.message}`);

    // RLS turns a denied UPDATE into "0 rows", not an error — select back to detect it.
    const { data: linked, error: linkError } = await supabase
      .from(tableId)
      .update({ album_id: album.id })
      .eq(primaryKey, recordId)
      .select(primaryKey);
    if (linkError) throw new Error(`Could not link album: ${linkError.message}`);
    if (!linked || linked.length === 0) throw new Error('Could not link album: you do not have permission to edit this entry');

    // Keep the outer form in sync so its Save doesn't write album_id back to null.
    onChange('album_id', album.id);
    return album.id;
  };

  const addFiles = async (fileList: FileList | File[]) => {
    if (!recordId) return;
    const files = Array.from(fileList);
    const accepted: File[] = [];
    for (const file of files) {
      const reason = rejectReason(file);
      if (reason) toast.error(reason);
      else accepted.push(file);
    }
    if (accepted.length === 0) return;

    setUploadingCount((n) => n + accepted.length);
    try {
      let targetAlbumId = albumIdRef.current;
      if (!targetAlbumId) {
        // Share one in-flight creation between overlapping drops.
        creatingRef.current ??= createAndLinkAlbum().finally(() => {
          creatingRef.current = null;
        });
        targetAlbumId = await creatingRef.current;
        albumIdRef.current = targetAlbumId;
      }

      let nextOrder = photos.reduce((max, p) => Math.max(max, p.sort_order ?? 0), 0) + 1;
      for (const file of accepted) {
        try {
          const { publicUrl } = await uploadMediaFile(file, { bucketName: 'media', folderPrefix: 'images/' });
          const { data, error } = await supabase
            .from('gallery_media')
            .insert({ album_id: targetAlbumId, media_type: 'image', url: publicUrl, sort_order: nextOrder, status: 'published' })
            .select('id, url, sort_order')
            .single();
          if (error) throw error;
          nextOrder += 1;
          setPhotos((prev) => [...prev, data]);
        } catch (err: any) {
          toast.error(`${file.name}: ${err.message}`);
        } finally {
          setUploadingCount((n) => n - 1);
        }
      }
    } catch (err: any) {
      console.error('Entry album upload failed:', err);
      toast.error(err.message);
      // Only album creation/linking throws out here, before any file was counted down.
      setUploadingCount((n) => n - accepted.length);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = async (photo: AlbumPhoto) => {
    if (!window.confirm('Remove this photo from the album?')) return;
    const prev = photos;
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
    const { error } = await supabase.from('gallery_media').delete().eq('id', photo.id);
    if (error) {
      toast.error(`Could not remove photo: ${error.message}`);
      setPhotos(prev);
    }
  };

  const persistOrder = async (next: AlbumPhoto[]) => {
    const prev = photos;
    const renumbered = next.map((p, i) => ({ ...p, sort_order: i + 1 }));
    setPhotos(renumbered);
    const changed = renumbered.filter((p) => prev.find((o) => o.id === p.id)?.sort_order !== p.sort_order);
    const results = await Promise.all(changed.map((p) => supabase.from('gallery_media').update({ sort_order: p.sort_order }).eq('id', p.id)));
    const failed = results.find((r: any) => r.error);
    if (failed) {
      toast.error(`Could not save the new order: ${failed.error.message}`);
      setPhotos(prev);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  const dropZoneHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      setDropActive(true);
    },
    onDragLeave: () => setDropActive(false),
    onDrop: (e: React.DragEvent) => {
      if (!e.dataTransfer.files?.length) return;
      e.preventDefault();
      setDropActive(false);
      addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Photos</p>

      {/* 1. Card photo */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Card photo</label>
        <MediaUploader value={values.card_photo_url || ''} onChange={(url) => onChange('card_photo_url', url)} type="image" />
      </div>

      {/* 2. Entry album */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">More photos</label>
        {!recordId ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
            Save this first, then add photos.
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />

            {loadingPhotos ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-crimson" />
              </div>
            ) : photos.length > 0 ? (
              <>
                <ul className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <li
                      key={photo.id}
                      draggable
                      onDragStart={(e) => {
                        setDragIndex(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        if (dragIndex === null) return;
                        e.preventDefault();
                        setOverIndex(index);
                      }}
                      onDrop={(e) => {
                        if (dragIndex === null) return;
                        e.preventDefault();
                        move(dragIndex, index);
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      className={`group relative aspect-square cursor-grab overflow-hidden rounded border bg-white active:cursor-grabbing ${
                        overIndex === index && dragIndex !== index ? 'border-crimson ring-2 ring-crimson/40' : 'border-slate-200'
                      } ${dragIndex === index ? 'opacity-40' : ''}`}
                    >
                      <img src={photo.url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" draggable={false} />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo)}
                        title="Remove photo"
                        className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => move(index, index - 1)}
                          disabled={index === 0}
                          title="Move earlier"
                          className="rounded bg-white/90 p-1 text-slate-600 shadow hover:text-navy disabled:invisible"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, index + 1)}
                          disabled={index === photos.length - 1}
                          title="Move later"
                          className="rounded bg-white/90 p-1 text-slate-600 shadow hover:text-navy disabled:invisible"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500">Drag photos to reorder. The card photo is set separately above.</p>
              </>
            ) : null}

            <div
              {...dropZoneHandlers}
              onClick={() => !busy && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition ${
                dropActive ? 'border-crimson bg-crimson/5 text-crimson' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100'
              }`}
            >
              {busy ? (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-crimson" />
                  Uploading {uploadingCount} photo{uploadingCount === 1 ? '' : 's'}...
                </div>
              ) : (
                <>
                  <ImagePlus className="mb-1 h-5 w-5" />
                  <p className="text-sm font-semibold text-navy">
                    {albumId ? 'Drag in more photos' : 'Drag in photos to add a gallery'} or <span className="text-crimson">browse</span>
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 3. Detail page */}
      {hasDetailPageField && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="has_detail_page"
            checked={!!values.has_detail_page}
            onChange={(e) => onChange('has_detail_page', e.target.checked)}
            className="h-4 w-4 rounded border-slate-200 bg-white text-crimson focus:ring-crimson focus:ring-offset-white disabled:opacity-50"
          />
          <label htmlFor="has_detail_page" className="ml-2 text-sm text-slate-600">
            Give this its own page
          </label>
        </div>
      )}
    </div>
  );
}
