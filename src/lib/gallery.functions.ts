import { publicSupabase } from '@/lib/supabase-public';
import type { EntryAlbum } from '@/lib/entry';

export interface GalleryMedia {
  id: string;
  album_id: string;
  media_type: 'image' | 'video';
  url: string;
  caption: string | null;
  sort_order: number;
  status: string;
  metadata: { alt?: string };
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  scope_type: string;
  status: string;
  metadata: { accent?: string };
}

export interface GalleryAlbumWithMedia extends GalleryAlbum {
  media: GalleryMedia[];
}

export async function getAllGalleryAlbums() {
  const supabase = publicSupabase();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as GalleryAlbum[];
}

export async function getGalleryAlbumWithMedia(albumId: string) {
  const supabase = publicSupabase();
  const { data: album, error: albumError } = await supabase
    .from('gallery_albums')
    .select('*')
    .eq('id', albumId)
    .eq('status', 'published')
    .maybeSingle();

  if (albumError) throw albumError;
  if (!album) return null;

  const { data: media, error: mediaError } = await supabase
    .from('gallery_media')
    .select('*')
    .eq('album_id', albumId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (mediaError) throw mediaError;

  return {
    ...(album as unknown as GalleryAlbum),
    media: (media ?? []) as unknown as GalleryMedia[],
  } as GalleryAlbumWithMedia;
}

/**
 * Load an Entry album (CONTEXT.md) as the shared `EntryAlbum` shape: the
 * album's published image media in display order. Returns null when there is
 * no album id, the album isn't published, or it has no photos — callers then
 * fall back to the Card photo.
 */
export async function getEntryAlbum(albumId: string | null | undefined): Promise<EntryAlbum | null> {
  if (!albumId) return null;
  return (await getEntryAlbums([albumId])).get(albumId) ?? null;
}

/**
 * Batch form of `getEntryAlbum` for a grid of Cards: one query for every
 * album's published photos. Returns a map keyed by album id; albums that are
 * unpublished or empty are simply absent.
 */
export async function getEntryAlbums(
  albumIds: Array<string | null | undefined>,
): Promise<Map<string, EntryAlbum>> {
  const ids = [...new Set(albumIds.filter((id): id is string => !!id))];
  const result = new Map<string, EntryAlbum>();
  if (ids.length === 0) return result;

  const supabase = publicSupabase();
  const { data: albums, error: albumError } = await supabase
    .from('gallery_albums')
    .select('id')
    .in('id', ids)
    .eq('status', 'published')
    .is('deleted_at', null);
  if (albumError) throw albumError;
  const publishedIds = (albums ?? []).map((a) => a.id);
  if (publishedIds.length === 0) return result;

  const { data: media, error: mediaError } = await supabase
    .from('gallery_media')
    .select('id, album_id, url, caption, media_type')
    .in('album_id', publishedIds)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });
  if (mediaError) throw mediaError;

  for (const m of media ?? []) {
    if (m.media_type !== 'image' || !m.url) continue;
    const album = result.get(m.album_id) ?? { id: m.album_id, media: [] };
    album.media.push({ id: m.id, url: m.url, caption: m.caption });
    result.set(m.album_id, album);
  }
  return result;
}
