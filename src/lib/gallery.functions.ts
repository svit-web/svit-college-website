import { publicSupabase } from '@/lib/supabase-public';

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
