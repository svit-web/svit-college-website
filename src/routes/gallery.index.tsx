import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { getAllGalleryAlbums } from "@/lib/gallery.functions";
import type { GalleryAlbum } from "@/lib/gallery.functions";
import { Images } from "lucide-react";

export const Route = createFileRoute("/gallery/")({
  loader: async () => {
    const albums = await getAllGalleryAlbums();
    return { albums };
  },
  component: GalleryIndex,
});

function GalleryIndex() {
  const { albums } = Route.useLoaderData();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-deep py-16 text-white">
        <div className="container-page text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">SVIT Vasad</div>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Gallery</h1>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            A glimpse into campus life, student achievements, and the vibrant community at SVIT.
          </p>
        </div>
      </section>

      <div className="container-page py-16">
        <SectionHeading eyebrow="Browse" title="Photo Albums" variant="eyebrow" />

        {albums.length === 0 ? (
          <p className="mt-8 text-muted-foreground">No albums available yet.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album: GalleryAlbum, i: number) => (
              <Reveal key={album.id} delay={i * 0.05}>
                <Link
                  to="/gallery/$albumId"
                  params={{ albumId: album.id }}
                  className="group block overflow-hidden rounded-2xl border-2 border-navy/15 bg-white hover:border-gold transition-colors"
                >
                  {/* Cover image placeholder / actual cover */}
                  <div className="relative aspect-video w-full overflow-hidden bg-navy/5">
                    {album.cover_image_url ? (
                      <img
                        src={album.cover_image_url}
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-navy/20">
                        <Images className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold text-navy group-hover:text-gold transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
