import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryAlbumView } from "@/components/site-next/GalleryAlbumView";
import { getGalleryAlbumWithMedia } from "@/lib/gallery.functions";
import { metaDescription } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getGalleryAlbumWithMedia(slug).catch(() => null);
  if (!album) return { title: "Album not found — SVIT Vasad", robots: { index: false } };
  return {
    title: `${album.title} — Gallery — SVIT Vasad`,
    description: metaDescription(album.description) ?? `Photos from ${album.title} at SVIT Vasad.`,
    alternates: { canonical: `/gallery/${album.slug}` },
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getGalleryAlbumWithMedia(slug).catch(() => null);
  if (!album) notFound();

  return <GalleryAlbumView album={album} />;
}
