'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/app/lib/supabase/client';
import { uploadMediaFile } from '@/lib/upload-media-next';

// The "Photos" section of an Entry's edit form (see CONTEXT.md: Entry, Cover
// photo, Entry album, Detail page). One grid, one dropzone: every photo is a
// gallery_media row, and the cover is just the row tagged is_cover — there is
// no separate Card photo column any more (card_photo_url is kept on the table
// as an unused rollback safety net, never read or written here).
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
  caption: string | null;
  isCover: boolean;
}

interface EntryPhotosEditorProps {
  tableId: string;
  // Primary key of the Entry being edited; null for a new, unsaved Entry.
  recordId: string | null;
  primaryKey: string;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  hasDetailPageField: boolean;
  // Only the club / news / achievement tables carry image_fit.
  hasImageFitField?: boolean;
  // Called instead of blocking the upload when recordId is null: validates
  // the form's required fields (surfacing the browser's own "please fill
  // this in" UI if any are missing, which rejects), then silently saves the
  // record and returns its new id. The host component keeps editing it from
  // there — the modal never closes, and a later explicit Save becomes an
  // update instead of a second insert.
  onRequireSave: () => Promise<string>;
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

function sortCoverFirst(photos: AlbumPhoto[]): AlbumPhoto[] {
  return [...photos].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.sort_order - b.sort_order);
}

export function EntryPhotosEditor({ tableId, recordId, primaryKey, values, onChange, hasDetailPageField, hasImageFitField, onRequireSave }: EntryPhotosEditorProps) {
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
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const busy = uploadingCount > 0;

  // Unchecked (hidden from the public gallery) by default, per the site's
  // convention for optional admin toggles. Mirrored into a ref so a
  // not-yet-created album picks up whatever was chosen before the first photo.
  const [showInGallery, setShowInGallery] = useState(false);
  const showInGalleryRef = useRef(false);

  useEffect(() => {
    if (!albumId) {
      setPhotos([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPhotos(true);
      const [mediaResult, albumResult] = await Promise.all([
        supabase
          .from('gallery_media')
          .select('id, url, sort_order, caption, is_cover')
          .eq('album_id', albumId)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true }),
        supabase.from('gallery_albums').select('show_in_public_gallery').eq('id', albumId).single(),
      ]);
      if (cancelled) return;
      if (mediaResult.error) toast.error(`Could not load photos: ${mediaResult.error.message}`);
      else
        setPhotos(
          sortCoverFirst(
            (mediaResult.data ?? []).map((p: any) => ({
              id: p.id,
              url: p.url,
              sort_order: p.sort_order,
              caption: p.caption,
              isCover: !!p.is_cover,
            })),
          ),
        );
      if (!albumResult.error && albumResult.data) {
        showInGalleryRef.current = !!albumResult.data.show_in_public_gallery;
        setShowInGallery(showInGalleryRef.current);
      }
      setLoadingPhotos(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [albumId, supabase]);

  const toggleShowInGallery = async (checked: boolean) => {
    setShowInGallery(checked);
    showInGalleryRef.current = checked;
    if (!albumId) return; // applied at album-creation time instead
    const { error } = await supabase.from('gallery_albums').update({ show_in_public_gallery: checked }).eq('id', albumId);
    if (error) {
      toast.error(`Could not update gallery visibility: ${error.message}`);
      setShowInGallery(!checked);
      showInGalleryRef.current = !checked;
    }
  };

  // Steps 1 + 2 of the RLS flow. Returns the linked album id.
  const createAndLinkAlbum = async (entryId: string): Promise<string> => {
    const title = String(values.title || values.name || 'Untitled').trim() || 'Untitled';
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${slugify(title) || tableId}-${suffix}`;

    const { data: album, error: albumError } = await supabase
      .from('gallery_albums')
      .insert({ title, slug, owner_table: tableId, show_in_public_gallery: showInGalleryRef.current, status: 'published' })
      .select('id')
      .single();
    if (albumError) throw new Error(`Could not create album: ${albumError.message}`);

    // RLS turns a denied UPDATE into "0 rows", not an error — select back to detect it.
    const { data: linked, error: linkError } = await supabase
      .from(tableId)
      .update({ album_id: album.id })
      .eq(primaryKey, entryId)
      .select(primaryKey);
    if (linkError) throw new Error(`Could not link album: ${linkError.message}`);
    if (!linked || linked.length === 0) throw new Error('Could not link album: you do not have permission to edit this entry');

    // Keep the outer form in sync so its Save doesn't write album_id back to null.
    onChange('album_id', album.id);
    return album.id;
  };

  // Shares one in-flight ensureSaved() between overlapping drops, same
  // pattern as creatingRef below for the album.
  const savingRef = useRef<Promise<string> | null>(null);

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const accepted: File[] = [];
    for (const file of files) {
      const reason = rejectReason(file);
      if (reason) toast.error(reason);
      else accepted.push(file);
    }
    if (accepted.length === 0) return;

    let entryId = recordId;
    if (!entryId) {
      try {
        savingRef.current ??= onRequireSave().finally(() => {
          savingRef.current = null;
        });
        entryId = await savingRef.current;
      } catch (err: any) {
        toast.error(err.message);
        return;
      }
    }

    // The first photo this Entry has ever gotten becomes the cover.
    let needsCover = !photos.some((p) => p.isCover);

    setUploadingCount((n) => n + accepted.length);
    try {
      let targetAlbumId = albumIdRef.current;
      if (!targetAlbumId) {
        // Share one in-flight creation between overlapping drops.
        creatingRef.current ??= createAndLinkAlbum(entryId).finally(() => {
          creatingRef.current = null;
        });
        targetAlbumId = await creatingRef.current;
        albumIdRef.current = targetAlbumId;
      }

      let nextOrder = photos.reduce((max, p) => Math.max(max, p.sort_order ?? 0), 0) + 1;
      for (const file of accepted) {
        const isCover = needsCover;
        try {
          const { publicUrl } = await uploadMediaFile(file, { bucketName: 'media', folderPrefix: 'images/' });
          const { data, error } = await supabase
            .from('gallery_media')
            .insert({ album_id: targetAlbumId, media_type: 'image', url: publicUrl, sort_order: nextOrder, is_cover: isCover, status: 'published' })
            .select('id, url, sort_order, caption, is_cover')
            .single();
          if (error) throw error;
          nextOrder += 1;
          if (isCover) needsCover = false;
          setPhotos((prev) =>
            sortCoverFirst([...prev, { id: data.id, url: data.url, sort_order: data.sort_order, caption: data.caption, isCover: !!data.is_cover }]),
          );
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

  const setCover = async (photo: AlbumPhoto) => {
    if (photo.isCover || settingCoverId) return;
    const previousCover = photos.find((p) => p.isCover) ?? null;
    setSettingCoverId(photo.id);
    try {
      // Unset before set — the partial unique index on (album_id) WHERE
      // is_cover allows at most one true at a time, so this order never
      // trips it. A failure after the unset just leaves no cover tagged,
      // which the admin can retry rather than silently corrupting state.
      if (previousCover) {
        const { error } = await supabase.from('gallery_media').update({ is_cover: false }).eq('id', previousCover.id);
        if (error) throw error;
      }
      const { error } = await supabase.from('gallery_media').update({ is_cover: true }).eq('id', photo.id);
      if (error) throw error;
      setPhotos((prev) => sortCoverFirst(prev.map((p) => ({ ...p, isCover: p.id === photo.id }))));
    } catch (err: any) {
      toast.error(`Could not set cover: ${err.message}`);
    } finally {
      setSettingCoverId(null);
    }
  };

  const updateCaption = async (photo: AlbumPhoto, caption: string) => {
    const trimmed = caption.trim() || null;
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, caption: trimmed } : p)));
    const { error } = await supabase.from('gallery_media').update({ caption: trimmed }).eq('id', photo.id);
    if (error) {
      toast.error(`Could not save caption: ${error.message}`);
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, caption: photo.caption } : p)));
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
      return;
    }
    // The cover photo was deleted — promote whatever is now first, if any.
    if (photo.isCover) {
      const next = prev.filter((x) => x.id !== photo.id);
      if (next.length > 0) await setCover(next[0]);
    }
  };

  const persistOrder = async (next: AlbumPhoto[]) => {
    const prev = photos;
    const renumbered = next.map((p, i) => ({ ...p, sort_order: i + 1 }));
    setPhotos(sortCoverFirst(renumbered));
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

      <div className="space-y-1.5">
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${tableId}-show-in-gallery`}
            checked={showInGallery}
            onChange={(e) => toggleShowInGallery(e.target.checked)}
            className="h-4 w-4 rounded border-slate-200 bg-white text-crimson focus:ring-crimson focus:ring-offset-white disabled:opacity-50"
          />
          <label htmlFor={`${tableId}-show-in-gallery`} className="ml-2 text-sm text-slate-600">
            Also show in Gallery
          </label>
        </div>
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
                      className={`group space-y-1 ${dragIndex === index ? 'opacity-40' : ''}`}
                    >
                      <div
                        className={`relative aspect-square cursor-grab overflow-hidden rounded border bg-white active:cursor-grabbing ${
                          overIndex === index && dragIndex !== index
                            ? 'border-crimson ring-2 ring-crimson/40'
                            : photo.isCover
                              ? 'border-crimson'
                              : 'border-slate-200'
                        }`}
                      >
                        <img src={photo.url} alt={photo.caption || `Photo ${index + 1}`} className="h-full w-full object-cover" draggable={false} />
                        {photo.isCover && (
                          <div className="absolute top-1 left-1 flex items-center gap-1 rounded-full bg-crimson/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                            <Star className="h-2.5 w-2.5 fill-current" /> Cover
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(photo)}
                          title="Remove photo"
                          className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute inset-x-1 bottom-1 flex items-center justify-between opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => move(index, index - 1)}
                            disabled={index === 0}
                            title="Move earlier"
                            className="rounded bg-white/90 p-1 text-slate-600 shadow hover:text-navy disabled:invisible"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                          {!photo.isCover && (
                            <button
                              type="button"
                              onClick={() => setCover(photo)}
                              disabled={settingCoverId === photo.id}
                              title="Set as cover"
                              className="rounded bg-white/90 px-1 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-600 shadow hover:text-crimson disabled:opacity-50"
                            >
                              {settingCoverId === photo.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Set cover'}
                            </button>
                          )}
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
                      </div>
                      <input
                        type="text"
                        defaultValue={photo.caption || ''}
                        onBlur={(e) => {
                          if (e.target.value.trim() !== (photo.caption || '')) updateCaption(photo, e.target.value);
                        }}
                        placeholder="Caption / alt text"
                        title="Caption / alt text"
                        className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-crimson focus:outline-none"
                      />
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-500">
                  Drag photos to reorder. The first/starred photo is the cover shown on its Card — hover another photo and click "Set cover" to change it.
                </p>
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
                    {photos.length > 0 ? 'Drag in more photos' : 'Drag in photos'} or <span className="text-crimson">browse</span>
                  </p>
                  {photos.length === 0 && <p className="mt-1 text-xs text-slate-400">The first one becomes the cover shown on its Card.</p>}
                </>
              )}
            </div>
          </>
      </div>

      {hasImageFitField && (
        <div className="space-y-1.5">
          <label htmlFor="image_fit" className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Detail page image
          </label>
          <select
            id="image_fit"
            value={values.image_fit === 'fit' ? 'fit' : 'fill'}
            onChange={(e) => onChange('image_fit', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="fit">Fit: show the whole photo</option>
            <option value="fill">Fill: crop to the frame</option>
          </select>
          <p className="text-xs text-slate-400">
            Only affects this item's own page. Cards and lists always crop to a uniform size.
          </p>
        </div>
      )}

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
