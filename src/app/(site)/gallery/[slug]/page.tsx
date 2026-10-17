import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryAlbumView } from "@/components/site-next/GalleryAlbumView";
import { getAllGalleryAlbums, getGalleryAlbumWithMedia } from "@/lib/gallery.functions";
import { metaDescription } from "@/lib/seo";

// ISR: this page reads from Supabase (not Next's fetch()), so without this
// it re-queries the DB on every single request. Caching the render for 5
// minutes removes that from the hot path; admin writes still show up
// immediately via revalidatePublicSite()'s revalidatePath('/', 'layout')
// (src/app/admin/actions.ts), which invalidates this on-demand regardless
// of the window below. See optimization_plan.md A3/A4.
export const revalidate = 300; // seconds

export async function generateStaticParams() {
  const albums = await getAllGalleryAlbums().catch(() => []);
  return albums.map((a) => ({ slug: a.slug }));
}

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
