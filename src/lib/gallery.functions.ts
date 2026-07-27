import { createServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';

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

export const getAllGalleryAlbums = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as GalleryAlbum[];
  });

export const getGalleryAlbumWithMedia = createServerFn({ method: 'GET' })
  .validator((albumId: string) => albumId)
  .handler(async (ctx) => {
    const { data: album, error: albumError } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('id', ctx.data)
      .eq('status', 'published')
      .maybeSingle();

    if (albumError) throw albumError;
    if (!album) return null;

    const { data: media, error: mediaError } = await supabase
      .from('gallery_media')
      .select('*')
      .eq('album_id', ctx.data)
      .eq('status', 'published')
      .order('sort_order', { ascending: true });

    if (mediaError) throw mediaError;

    return {
      ...(album as unknown as GalleryAlbum),
      media: (media ?? []) as unknown as GalleryMedia[],
    } as GalleryAlbumWithMedia;
  });
