import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryAlbumView } from "@/components/site-next/GalleryAlbumView";
import { getGalleryAlbumWithMedia } from "@/lib/gallery.functions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumId: string }>;
}): Promise<Metadata> {
  const { albumId } = await params;
  const album = await getGalleryAlbumWithMedia(albumId).catch(() => null);
  if (!album) return { title: "Album not found — SVIT Vasad" };
  return { title: `${album.title} — Gallery — SVIT Vasad` };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const album = await getGalleryAlbumWithMedia(albumId).catch(() => null);
  if (!album) notFound();

  return <GalleryAlbumView album={album} />;
}
